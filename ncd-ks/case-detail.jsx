// Menu 2: แบบตอบกลับข้อมูล + Case detail
// Left column: original case data (read-only). Right column: response template + editable doc preview.

// Legacy copy fallback for iframes / non-secure contexts where navigator.clipboard fails silently.
const legacyCopy = (text) => {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0"; ta.style.left = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch { return false; }
};

const emptyResponse = () => ({
  diagnosis: "",
  plans: {
    med: false,
    lifestyle: false,
    bp_home: false, bp_home_freq: "weekly_wed",
    smbg: false, smbg_duration: "1 สัปดาห์",
    followup: false, followup_type: "rpsto", followup_date: "", followup_time: "09:00",
  },
  meds: { diabetes: [], hypertension: [], lipid: [] },
  note: "",
  responder: "",
  respondedAt: "",
});

const CaseDetail = ({ caseData, user, onUpdate, onBack, onEdit }) => {
  const [editingResponse, setEditingResponse] = useState(caseData.status !== "responded" && (user.role === "doctor"));
  const [resp, setResp] = useState(caseData.response || emptyResponse());
  const [docEdit, setDocEdit] = useState(false);
  const [docText, setDocText] = useState("");
  const [lightIdx, setLightIdx] = useState(null);

  const canRespond = user.role === "doctor";
  const isResponded = caseData.status === "responded";

  const setPlan = (k, v) => setResp((r) => ({ ...r, plans: { ...r.plans, [k]: v } }));

  const buildDoc = (r) => {
    const lines = [];
    lines.push(`สรุปการตอบกลับเคสปรึกษา ${caseData.id}`);
    lines.push(`ผู้ป่วย: ${caseData.patient} อายุ ${caseData.age} ปี (${caseData.hospital})`);
    lines.push(`ส่งโดย: ${caseData.submittedBy} เมื่อ ${thaiDate(caseData.submittedAt)}`);
    lines.push("");
    lines.push("== สรุปการวินิจฉัย ==");
    lines.push(r.diagnosis || "—");
    lines.push("");
    lines.push("== แผนการรักษา ==");
    if (r.plans.med) {
      lines.push("• ปรับยาให้รับประทาน ดังนี้");
      const all = [
        ...(r.meds.diabetes || []).map((m) => ({ cat: "[เบาหวาน]", m })),
        ...(r.meds.hypertension || []).map((m) => ({ cat: "[ความดัน]", m })),
        ...(r.meds.lipid || []).map((m) => ({ cat: "[ไขมัน]", m })),
      ];
      all.forEach(({ cat, m }) => {
        lines.push(`   ${cat} ${m.drug || "(ไม่ระบุ)"} — ครั้งละ ${m.per} เม็ด ${m.when} (${(m.times || []).join(", ")})`);
      });
      if (!all.length) lines.push("   (ยังไม่ระบุรายการยา)");
    }
    if (r.plans.lifestyle) lines.push("• ปรับพฤติกรรม ควบคุมอาหาร ออกกำลังกาย");
    if (r.plans.bp_home) {
      const freq = r.plans.bp_home_freq === "weekly_wed" ? "ทุกวันพุธ สัปดาห์ละครั้ง จนถึงนัด" :
                   r.plans.bp_home_freq === "daily_1wk" ? "ทุกวัน เป็นเวลา 1 สัปดาห์" : "";
      lines.push(`• วัดความดันที่บ้าน — ${freq}`);
    }
    if (r.plans.smbg) lines.push(`• เจาะน้ำตาลที่บ้าน (SMBG) เป็นเวลา ${r.plans.smbg_duration}`);
    if (r.plans.followup) {
      if (r.plans.followup_type === "rpsto") lines.push("• นัดติดตามที่ รพ.สต. ตามนัดเดิม");
      else lines.push(`• นัดติดตามที่ รพ.คอนสาร NCD clinic วันที่ ${r.plans.followup_date || "(ระบุ)"} เวลา ${r.plans.followup_time || ""}`);
    }
    if (r.note) {
      lines.push("");
      lines.push("== หมายเหตุเพิ่มเติม ==");
      lines.push(r.note);
    }
    lines.push("");
    lines.push(`ตอบกลับโดย: ${r.responder || user.name} · ${thaiDate(r.respondedAt || new Date().toISOString())}`);
    return lines.join("\n");
  };

  const docComputed = useMemo(() => buildDoc(resp), [resp, caseData]);
  const docDisplay = docEdit ? docText : docComputed;

  const submitResponse = () => {
    if (!resp.diagnosis.trim()) { showToast("กรุณาระบุสรุปการวินิจฉัย", "error"); return; }
    const finalDoc = docEdit ? docText : docComputed;
    const updated = {
      ...caseData,
      status: "responded",
      response: {
        ...resp,
        responder: resp.responder || user.name,
        respondedAt: new Date().toISOString(),
        finalDoc,
      },
    };
    onUpdate(updated);
    showToast("ส่งคำตอบกลับให้ รพ.สต. เรียบร้อย", "success");
    setEditingResponse(false);
  };

  const [copyModal, setCopyModal] = useState(null);

  const copyDoc = () => {
    const text = docDisplay;
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        () => showToast("คัดลอกสรุปเรียบร้อย", "success"),
        () => { if (legacyCopy(text)) showToast("คัดลอกสรุปเรียบร้อย", "success"); else setCopyModal(text); }
      );
    } else {
      if (legacyCopy(text)) showToast("คัดลอกสรุปเรียบร้อย", "success");
      else setCopyModal(text);
    }
  };

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          <Icon name="arrow-left" size={14} /> กลับ
        </button>
        <span className="muted" style={{ fontSize: 13 }}>หน้าหลัก / เคสปรึกษา / {caseData.id}</span>
        <span className="spacer" />
        {isResponded ? (
          <span className="tag green"><Icon name="check" size={11} /> ตอบกลับแล้ว</span>
        ) : caseData.urgent ? (
          <span className="tag amber"><Icon name="alert" size={11} /> เร่งด่วน · รอตอบกลับ</span>
        ) : (
          <span className="tag red">รอตอบกลับ</span>
        )}
        {user.role === "staff" && caseData.submittedFrom === user.hospital && !isResponded && (
          <button className="btn btn-sm" onClick={onEdit}><Icon name="edit" size={12} /> แก้ไขเคส</button>
        )}
      </div>

      <div className="page-head" style={{ marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--ink-400)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>{caseData.id}</div>
          <h1 className="page-title" style={{ marginTop: 4 }}>{caseData.patient}</h1>
          <p className="page-subtitle">
            อายุ {caseData.age} ปี · {caseData.hospital} · ส่งโดย {caseData.submittedBy} · {thaiDate(caseData.submittedAt)}
          </p>
        </div>
      </div>

      <div className="detail-grid">
        {/* ============== LEFT: original case ============== */}
        <div style={{ display: "grid", gap: 16 }}>
          <div className="card card-pad-lg">
            <div className="card-head">
              <h3 className="card-title"><Icon name="user" size={16} /> ข้อมูลเคส</h3>
            </div>
            <dl className="info-grid">
              <dt>โรคประจำตัว</dt>
              <dd>
                <div className="chip-group" style={{ gap: 6 }}>
                  {caseData.diseases?.length ? caseData.diseases.map((d) => <span key={d} className="tag">{d}</span>) : <span className="muted">—</span>}
                </div>
                {caseData.ckdStage && <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 4 }}>CKD: {caseData.ckdStage}</div>}
                {caseData.diseasesOther && <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 4 }}>อื่นๆ: {caseData.diseasesOther}</div>}
              </dd>

              <dt>ประเด็นปรึกษา</dt>
              <dd>
                <div className="chip-group" style={{ gap: 6 }}>
                  {caseData.topics?.length ? caseData.topics.map((t) => (
                    <span key={t} className="tag" style={{ background: "var(--blue-50)", color: "var(--blue-400)", borderColor: "#D1E4F1" }}>{t}</span>
                  )) : <span className="muted">—</span>}
                </div>
                {caseData.topicsOther && <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 4 }}>อื่นๆ: {caseData.topicsOther}</div>}
              </dd>

              <dt>รายละเอียด</dt>
              <dd style={{ whiteSpace: "pre-wrap", fontWeight: 400 }}>{caseData.note || <span className="muted">—</span>}</dd>
            </dl>
          </div>

          <div className="card card-pad-lg">
            <div className="card-head">
              <h3 className="card-title"><Icon name="image" size={16} /> รูปภาพประกอบ</h3>
              <span className="muted" style={{ fontSize: 12 }}>{caseData.images?.length || 0} รูป · คลิกเพื่อขยาย</span>
            </div>
            {caseData.images?.length ? (
              <div className="thumbs">
                {caseData.images.map((im, i) => (
                  <div key={im.id || i} className="thumb" onClick={() => setLightIdx(i)}>
                    <img src={im.dataUrl} alt={im.name || ""} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="muted" style={{ fontSize: 13.5, padding: "10px 0" }}>— ไม่มีรูปภาพ —</div>
            )}
          </div>

          <div className="card card-pad-lg">
            <div className="card-head">
              <h3 className="card-title"><Icon name="pill" size={16} /> ยาที่ใช้ปัจจุบัน</h3>
            </div>
            <MedList meds={caseData.meds || {}} />
          </div>
        </div>

        {/* ============== RIGHT: Response ============== */}
        <div style={{ display: "grid", gap: 16 }}>
          <div className="card card-pad-lg" style={{ borderColor: isResponded ? "var(--green-100)" : "var(--mint-200)", background: isResponded ? "#F6FBF8" : "white" }}>
            <div className="card-head">
              <h3 className="card-title">
                <Icon name="stethoscope" size={16} /> แบบตอบกลับข้อมูล
              </h3>
              {isResponded && !editingResponse && (
                <button className="btn btn-sm btn-ghost" onClick={() => setEditingResponse(true)} disabled={!canRespond}>
                  <Icon name="edit" size={12} /> แก้ไขคำตอบ
                </button>
              )}
            </div>

            {!editingResponse && isResponded ? (
              <ResponseView response={caseData.response} />
            ) : !canRespond ? (
              <div style={{ background: "var(--cream-100)", padding: 16, borderRadius: 12, fontSize: 13.5, color: "var(--ink-500)", textAlign: "center" }}>
                <Icon name="clock" size={20} style={{ marginBottom: 6 }} /><br />
                เคสนี้ยังรอแพทย์ทบทวน — เฉพาะแพทย์/พยาบาล NCD เท่านั้นที่ตอบกลับได้
              </div>
            ) : (
              <ResponseForm resp={resp} setResp={setResp} setPlan={setPlan} />
            )}
          </div>

          {/* Document preview / copy */}
          {(editingResponse || isResponded) && canRespond && (
            <div className="card card-pad-lg">
              <div className="card-head">
                <h3 className="card-title"><Icon name="file-text" size={16} /> สรุปการตอบกลับ (Document)</h3>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-sm btn-ghost" onClick={() => {
                    if (!docEdit) { setDocText(docComputed); }
                    setDocEdit(!docEdit);
                  }}>
                    <Icon name={docEdit ? "check" : "edit"} size={12} /> {docEdit ? "เสร็จ" : "แก้ไข"}
                  </button>
                  <button className="btn btn-sm" onClick={copyDoc}>
                    <Icon name="copy" size={12} /> คัดลอก
                  </button>
                </div>
              </div>
              {docEdit ? (
                <textarea className="textarea" rows="14" value={docText} onChange={(e) => setDocText(e.target.value)}
                  style={{ fontFamily: "var(--font)", fontSize: 13.5 }} />
              ) : (
                <div className="doc-preview">{docDisplay}</div>
              )}
            </div>
          )}

          {editingResponse && canRespond && (
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
              {isResponded && <button className="btn btn-ghost" onClick={() => { setEditingResponse(false); setResp(caseData.response); }}>ยกเลิกแก้ไข</button>}
              <button className="btn btn-primary btn-lg" onClick={submitResponse}>
                <Icon name="send" size={16} /> {isResponded ? "อัพเดตคำตอบ" : "ส่งคำตอบกลับ"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============== Chat thread (full-width) ============== */}
      <h2 className="section-title" style={{ marginTop: 28 }}>กล่องข้อความ — รพ.สต. ⇔ รพ.คอนสาร</h2>
      <CaseChat caseData={caseData} user={user} onUpdate={onUpdate} />

      {copyModal !== null && (
        <CopyFallbackModal text={copyModal} onClose={() => setCopyModal(null)} />
      )}

      {lightIdx !== null && (
        <Lightbox images={caseData.images} startIdx={lightIdx} onClose={() => setLightIdx(null)} />
      )}
    </div>
  );
};

// ---------- Copy fallback modal — shown when clipboard API is blocked by the iframe ----------
const CopyFallbackModal = ({ text, onClose }) => {
  const taRef = useRef();
  useEffect(() => {
    // Pre-select the text so user just needs to press Cmd/Ctrl+C
    setTimeout(() => {
      if (taRef.current) {
        taRef.current.focus();
        taRef.current.select();
      }
    }, 50);
  }, []);
  const isMac = navigator.platform.toLowerCase().includes("mac");
  return (
    <Modal open={true} onClose={onClose} wide title={<><Icon name="copy" size={16} style={{ verticalAlign: "-3px" }} /> คัดลอกสรุปการตอบกลับ</>}
      footer={<button className="btn btn-primary" onClick={onClose}>เสร็จแล้ว</button>}>
      <div style={{ background: "var(--cream-100)", padding: 12, borderRadius: 10, fontSize: 13, marginBottom: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Icon name="info" size={14} style={{ color: "var(--mint-600)", marginTop: 2, flexShrink: 0 }} />
        <span>ข้อความถูกเลือกไว้แล้ว — กด <kbd style={kbdStyle}>{isMac ? "⌘" : "Ctrl"}</kbd> + <kbd style={kbdStyle}>C</kbd> เพื่อคัดลอก</span>
      </div>
      <textarea
        ref={taRef}
        readOnly
        value={text}
        className="textarea"
        style={{ fontFamily: "var(--font)", fontSize: 13.5, minHeight: 300, whiteSpace: "pre-wrap" }}
        onClick={(e) => e.currentTarget.select()}
      />
    </Modal>
  );
};
const kbdStyle = {
  display: "inline-block",
  padding: "1px 7px",
  background: "white",
  border: "1px solid var(--ink-200)",
  borderBottomWidth: 2,
  borderRadius: 5,
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--ink-700)",
  margin: "0 2px",
};

// ---------- Chat thread ----------
const CaseChat = ({ caseData, user, onUpdate }) => {
  const [text, setText] = useState("");
  const messages = caseData.messages || [];
  const listRef = useRef();

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  const send = () => {
    if (!text.trim()) return;
    const msg = {
      id: uid(),
      from: user.role === "staff" ? "staff" : "doctor",
      name: user.name,
      text: text.trim(),
      at: new Date().toISOString(),
    };
    onUpdate({ ...caseData, messages: [...messages, msg] });
    setText("");
    showToast("ส่งข้อความแล้ว", "success");
  };

  const canChat = user.role === "staff" || user.role === "doctor";

  return (
    <div className="card card-pad-lg">
      <div ref={listRef} className="chat">
        {messages.length === 0 ? (
          <div className="empty" style={{ padding: 24 }}>
            <div className="empty-icon" style={{ width: 48, height: 48 }}><Icon name="send" size={20} /></div>
            <div className="empty-title" style={{ fontSize: 14 }}>ยังไม่มีข้อความ</div>
            <div style={{ fontSize: 12.5 }}>ทักทาย ถามรายละเอียดเพิ่มเติม หรือแจ้งความคืบหน้าเคสได้ที่นี่</div>
          </div>
        ) : messages.map((m) => {
          const isMe = (m.from === "staff" && user.role === "staff") ||
                       (m.from === "doctor" && user.role === "doctor");
          return (
            <div key={m.id} className={`chat-bubble ${isMe ? "chat-from-doctor" : "chat-from-staff"}`}
                 style={!isMe ? {} : (m.from === "staff" ? { background: "var(--blue-400)" } : {})}>
              <div className="chat-name">{m.name}</div>
              <div>{m.text}</div>
              <div className="chat-time">{relativeTime(m.at)}</div>
            </div>
          );
        })}
      </div>
      {canChat ? (
        <div className="chat-input-row">
          <input
            className="input"
            placeholder={`พิมพ์ข้อความถึง${user.role === "staff" ? "ทีม NCD รพ.คอนสาร" : "ทีม รพ.สต."}...`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button className="btn btn-primary" onClick={send} disabled={!text.trim()}>
            <Icon name="send" size={14} /> ส่ง
          </button>
        </div>
      ) : (
        <div className="muted" style={{ fontSize: 12.5, padding: 10, textAlign: "center" }}>
          เฉพาะเจ้าหน้าที่ รพ.สต. และทีม NCD เท่านั้นที่สนทนาได้
        </div>
      )}
    </div>
  );
};

// ---------- Response Form (template) ----------
const ResponseForm = ({ resp, setResp, setPlan }) => {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="field">
        <label className="field-label">สรุปการวินิจฉัย <span className="req">*</span></label>
        <textarea className="textarea" rows="3" placeholder="เช่น DM type 2 with poor control + ACE-I induced cough..." value={resp.diagnosis} onChange={(e) => setResp({ ...resp, diagnosis: e.target.value })} />
      </div>

      <div>
        <label className="field-label" style={{ marginBottom: 8, display: "block" }}>แผนการรักษา (เลือกได้หลายข้อ)</label>
        <div style={{ display: "grid", gap: 8 }}>
          <PlanRow checked={resp.plans.med} onToggle={(v) => setPlan("med", v)} icon="pill" label="ปรับยาให้รับประทาน">
            {resp.plans.med && (
              <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                <MedPicker category="diabetes"    value={resp.meds.diabetes}    onChange={(v) => setResp({ ...resp, meds: { ...resp.meds, diabetes: v } })}    label="ยาเบาหวาน" />
                <MedPicker category="hypertension" value={resp.meds.hypertension} onChange={(v) => setResp({ ...resp, meds: { ...resp.meds, hypertension: v } })} label="ยาความดัน" />
                <MedPicker category="lipid"       value={resp.meds.lipid}       onChange={(v) => setResp({ ...resp, meds: { ...resp.meds, lipid: v } })}       label="ยาไขมัน" />
              </div>
            )}
          </PlanRow>

          <PlanRow checked={resp.plans.lifestyle} onToggle={(v) => setPlan("lifestyle", v)} icon="activity" label="ปรับพฤติกรรม ควบคุมอาหาร ออกกำลังกาย" />

          <PlanRow checked={resp.plans.bp_home} onToggle={(v) => setPlan("bp_home", v)} icon="heart-pulse" label="วัดความดันที่บ้าน">
            {resp.plans.bp_home && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                <ChipRadio checked={resp.plans.bp_home_freq === "weekly_wed"} onClick={() => setPlan("bp_home_freq", "weekly_wed")}>ทุกวันพุธ สัปดาห์ละครั้ง จนถึงนัด</ChipRadio>
                <ChipRadio checked={resp.plans.bp_home_freq === "daily_1wk"}  onClick={() => setPlan("bp_home_freq", "daily_1wk")}>ทุกวัน เป็นเวลา 1 สัปดาห์</ChipRadio>
              </div>
            )}
          </PlanRow>

          <PlanRow checked={resp.plans.smbg} onToggle={(v) => setPlan("smbg", v)} icon="activity" label="เจาะน้ำตาลที่บ้าน (SMBG)">
            {resp.plans.smbg && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
                <span className="field-hint">เป็นเวลา</span>
                <input className="input input-sm" style={{ width: 140 }} value={resp.plans.smbg_duration} onChange={(e) => setPlan("smbg_duration", e.target.value)} />
              </div>
            )}
          </PlanRow>

          <PlanRow checked={resp.plans.followup} onToggle={(v) => setPlan("followup", v)} icon="calendar" label="นัดติดตาม">
            {resp.plans.followup && (
              <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                <div className="chip-group">
                  <ChipRadio checked={resp.plans.followup_type === "rpsto"} onClick={() => setPlan("followup_type", "rpsto")}>ที่ รพ.สต. ตามนัดเดิม</ChipRadio>
                  <ChipRadio checked={resp.plans.followup_type === "ncd"}   onClick={() => setPlan("followup_type", "ncd")}>ที่ รพ.คอนสาร NCD clinic</ChipRadio>
                </div>
                {resp.plans.followup_type === "ncd" && (
                  <div className="row row-2">
                    <div className="field">
                      <label className="field-label">วันที่นัด</label>
                      <input type="date" className="input" value={resp.plans.followup_date} onChange={(e) => setPlan("followup_date", e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="field-label">เวลา</label>
                      <input type="time" className="input" value={resp.plans.followup_time} onChange={(e) => setPlan("followup_time", e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </PlanRow>
        </div>
      </div>

      <div className="field">
        <label className="field-label">หมายเหตุเพิ่มเติม</label>
        <textarea className="textarea" rows="3" placeholder="ข้อความถึงทีม รพ.สต." value={resp.note} onChange={(e) => setResp({ ...resp, note: e.target.value })} />
      </div>
    </div>
  );
};

const PlanRow = ({ checked, onToggle, icon, label, children }) => (
  <div style={{
    border: `1.5px solid ${checked ? "var(--mint-300)" : "var(--ink-100)"}`,
    background: checked ? "var(--mint-50)" : "white",
    borderRadius: 12, padding: 12,
    transition: "background .15s",
  }}>
    <label style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
      <span className={`box ${checked ? "checked-box" : ""}`} style={{
        width: 20, height: 20, borderRadius: 6,
        border: `1.5px solid ${checked ? "var(--mint-600)" : "var(--ink-300)"}`,
        background: checked ? "var(--mint-600)" : "white",
        display: "grid", placeItems: "center", color: "white", flexShrink: 0,
      }}>
        {checked && <Icon name="check" size={12} />}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} style={{ display: "none" }} />
      <Icon name={icon} size={16} style={{ color: checked ? "var(--mint-700)" : "var(--ink-500)" }} />
      <span style={{ fontWeight: 500, color: "var(--ink-900)" }}>{label}</span>
    </label>
    {children}
  </div>
);

// ---------- Read-only response view ----------
const ResponseView = ({ response }) => {
  const r = response || {};
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <div style={{ fontSize: 12, color: "var(--mint-700)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>สรุปการวินิจฉัย</div>
        <div style={{ fontSize: 14.5, lineHeight: 1.6 }}>{r.diagnosis || "—"}</div>
      </div>

      {r.plans?.med && (
        <div>
          <div style={{ fontSize: 12, color: "var(--mint-700)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>ปรับยา</div>
          <MedList meds={r.meds || {}} />
        </div>
      )}

      <div>
        <div style={{ fontSize: 12, color: "var(--mint-700)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>แผนการรักษา</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7 }}>
          {r.plans?.lifestyle && <li>ปรับพฤติกรรม ควบคุมอาหาร ออกกำลังกาย</li>}
          {r.plans?.bp_home && <li>วัดความดันที่บ้าน — {r.plans.bp_home_freq === "weekly_wed" ? "ทุกวันพุธ สัปดาห์ละครั้ง จนถึงนัด" : "ทุกวัน เป็นเวลา 1 สัปดาห์"}</li>}
          {r.plans?.smbg && <li>เจาะน้ำตาลที่บ้าน (SMBG) เป็นเวลา {r.plans.smbg_duration}</li>}
          {r.plans?.followup && <li>นัดติดตาม{r.plans.followup_type === "rpsto" ? "ที่ รพ.สต. ตามนัดเดิม" : ` ที่ รพ.คอนสาร NCD clinic วันที่ ${r.plans.followup_date || "(ระบุ)"} ${r.plans.followup_time || ""}`}</li>}
        </ul>
      </div>

      {r.note && (
        <div>
          <div style={{ fontSize: 12, color: "var(--mint-700)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>หมายเหตุ</div>
          <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{r.note}</div>
        </div>
      )}

      <div style={{ paddingTop: 10, borderTop: "1px dashed var(--ink-100)", fontSize: 12, color: "var(--ink-500)", display: "flex", justifyContent: "space-between" }}>
        <span><Icon name="user" size={11} style={{ verticalAlign: "-1px" }} /> ตอบกลับโดย {r.responder}</span>
        <span>{thaiDate(r.respondedAt)}</span>
      </div>
    </div>
  );
};

window.CaseDetail = CaseDetail;
