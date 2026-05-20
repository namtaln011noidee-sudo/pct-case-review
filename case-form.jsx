// case-form.jsx — Case data entry form (Menu 1: Sections 1 + 2)

function CaseForm({ caseData, onChange, currentUser }) {
  const c = caseData;
  const set = (patch) => onChange({ ...c, ...patch });

  // ─── Events (Section 2) ─────────────────────────
  function addEvent() {
    const newEvt = {
      id: "e" + Math.random().toString(36).slice(2, 8),
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      place: c.department || "",
      text: "",
    };
    set({ events: [...c.events, newEvt] });
  }
  function updateEvent(id, patch) {
    set({ events: c.events.map(e => e.id === id ? { ...e, ...patch } : e) });
  }
  function deleteEvent(id) {
    set({ events: c.events.filter(e => e.id !== id) });
  }
  function moveEvent(id, dir) {
    const idx = c.events.findIndex(e => e.id === id);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= c.events.length) return;
    const arr = [...c.events];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    set({ events: arr });
  }

  function toggleReason(r) {
    if (c.reasons.includes(r)) set({ reasons: c.reasons.filter(x => x !== r) });
    else set({ reasons: [...c.reasons, r] });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* ─── ส่วนที่ 1 รายละเอียดข้อมูล ───────────────────── */}
      <div className="card">
        <div className="card-h">
          <div>
            <h2>ส่วนที่ 1 — รายละเอียดข้อมูล</h2>
            <div className="sub">ข้อมูลพื้นฐานของเคสที่ทบทวน</div>
          </div>
          <span className="tag">Section 1</span>
        </div>
        <div className="card-b" style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          <div className="grid-3">
            <div className="field">
              <label>เลขที่เวชระเบียน (HN) <span className="req">*</span></label>
              <input className="in mono" placeholder="เช่น 67-04421"
                value={c.hn} onChange={e => set({ hn: e.target.value })} />
            </div>
            <div className="field">
              <label>วันที่ทบทวนเคส <span className="req">*</span></label>
              <div className="row" style={{ gap: 8, flexWrap: "nowrap" }}>
                <input type="date" className="in" value={c.reviewDate}
                  onChange={e => set({ reviewDate: e.target.value })} />
                <input type="time" className="in" value={c.reviewTime}
                  onChange={e => set({ reviewTime: e.target.value })}
                  style={{ width: 110 }} />
              </div>
            </div>
            <div className="field">
              <label>สถานะเคส</label>
              <select className="in" value={c.status} onChange={e => set({ status: e.target.value })}>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>วัน/เวลา Admit <span className="req">*</span></label>
              <div className="row" style={{ gap: 8, flexWrap: "nowrap" }}>
                <input type="date" className="in" value={c.admitDate}
                  onChange={e => set({ admitDate: e.target.value })} />
                <input type="time" className="in" value={c.admitTime}
                  onChange={e => set({ admitTime: e.target.value })}
                  style={{ width: 110 }} />
              </div>
            </div>
            <div className="field">
              <label>วัน/เวลา Discharge / เสียชีวิต</label>
              <div className="row" style={{ gap: 8, flexWrap: "nowrap" }}>
                <input type="date" className="in" value={c.dischargeDate}
                  onChange={e => set({ dischargeDate: e.target.value })} />
                <input type="time" className="in" value={c.dischargeTime}
                  onChange={e => set({ dischargeTime: e.target.value })}
                  style={{ width: 110 }} />
              </div>
            </div>
          </div>

          <div className="field">
            <label>แผนก / หน่วยงานที่ทบทวน <span className="req">*</span></label>
            <ChipsField
              options={DEPARTMENTS}
              value={c.department}
              onChange={v => set({ department: v })}
              multi={false}
            />
            {c.department === "อื่นๆ" && (
              <input className="in" placeholder="ระบุหน่วยงาน..."
                value={c.departmentOther}
                onChange={e => set({ departmentOther: e.target.value })}
                style={{ marginTop: 8 }} />
            )}
          </div>

          <div className="grid-2">
            <div className="field">
              <label>การวินิจฉัยโรคหลัก (Primary Diagnosis) <span className="req">*</span></label>
              <textarea className="in" rows={3}
                placeholder="เช่น Septic shock with community-acquired pneumonia"
                value={c.diagnosis}
                onChange={e => set({ diagnosis: e.target.value })} />
            </div>
            <div className="field">
              <label>ภาวะแทรกซ้อนที่เกิดขึ้น (Complications / Adverse Events)</label>
              <textarea className="in" rows={3}
                placeholder="เช่น AKI stage 2, AF with RVR"
                value={c.complications}
                onChange={e => set({ complications: e.target.value })} />
            </div>
          </div>

          <div className="field">
            <label>เหตุผลในการทบทวนเคส <span className="req">*</span> <span className="hint">(เลือกได้มากกว่าหนึ่ง)</span></label>
            <ChipsField options={REVIEW_REASONS} value={c.reasons}
              onChange={v => set({ reasons: v })} />
            {c.reasons.includes("อื่นๆ") && (
              <input className="in" placeholder="ระบุเหตุผลเพิ่มเติม..."
                value={c.reasonOther}
                onChange={e => set({ reasonOther: e.target.value })}
                style={{ marginTop: 8 }} />
            )}
          </div>

          <div className="field">
            <label>รายชื่อผู้ทบทวนเคส</label>
            <textarea className="in" rows={2}
              placeholder="เช่น นพ.สมชาย ใจดี, พญ.อรอนงค์ แสงทอง, พยาบาลวิภา"
              value={c.reviewers}
              onChange={e => set({ reviewers: e.target.value })} />
          </div>
        </div>
      </div>

      {/* ─── ส่วนที่ 2 บันทึกเหตุการณ์ ─────────────────────── */}
      <div className="card">
        <div className="card-h">
          <div>
            <h2>ส่วนที่ 2 — บันทึกเหตุการณ์ที่เกิดขึ้น</h2>
            <div className="sub">เพิ่มเหตุการณ์ตามลำดับเวลา · อาการ · ผลตรวจ · การให้การดูแลรักษา</div>
          </div>
          <span className="tag">Section 2</span>
        </div>
        <div className="card-b">
          {c.events.length === 0 ? (
            <div style={{ background: "var(--ink-50)", border: "1px dashed var(--ink-300)", borderRadius: 10, padding: "32px 16px", textAlign: "center", color: "var(--ink-500)" }}>
              <Icon.Clock size={24} />
              <p style={{ margin: "8px 0 12px" }}>ยังไม่มีเหตุการณ์ที่บันทึก</p>
              <button className="btn" onClick={addEvent}><Icon.Plus size={14} /> เพิ่มเหตุการณ์แรก</button>
            </div>
          ) : (
            <div className="evt-list">
              {c.events.map((ev, idx) => (
                <EventItem
                  key={ev.id}
                  ev={ev} idx={idx} total={c.events.length}
                  onUpdate={(p) => updateEvent(ev.id, p)}
                  onDelete={() => deleteEvent(ev.id)}
                  onMove={(d) => moveEvent(ev.id, d)}
                />
              ))}
            </div>
          )}

          {c.events.length > 0 && (
            <button className="btn subtle" onClick={addEvent} style={{ marginTop: 14 }}>
              <Icon.Plus size={14} /> เพิ่มเหตุการณ์
            </button>
          )}

          <div style={{ height: 1, background: "var(--ink-100)", margin: "22px 0" }} />

          <div className="grid-2">
            <div className="field">
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ width: 6, height: 6, borderRadius: 50, background: "var(--ok)" }} />
                จุดแข็ง / สิ่งที่ทำได้ดีในการดูแลผู้ป่วยรายนี้
              </label>
              <textarea className="in" rows={5}
                placeholder="เช่น ทีม ER ตอบสนองรวดเร็ว เริ่ม Sepsis bundle ภายใน 1 ชม..."
                value={c.strengths}
                onChange={e => set({ strengths: e.target.value })} />
            </div>
            <div className="field">
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ width: 6, height: 6, borderRadius: 50, background: "var(--err)" }} />
                จุดอ่อน / สิ่งที่ควรพัฒนาในการดูแลผู้ป่วยรายนี้
              </label>
              <textarea className="in" rows={5}
                placeholder="เช่น การประเมินภาวะ cardiac dysfunction ยังไม่ครอบคลุม..."
                value={c.weaknesses}
                onChange={e => set({ weaknesses: e.target.value })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventItem({ ev, idx, total, onUpdate, onDelete, onMove }) {
  const [editing, setEditing] = React.useState(ev.text === "");
  const [draft, setDraft] = React.useState(ev);
  const [confirmDel, setConfirmDel] = React.useState(false);

  React.useEffect(() => { setDraft(ev); }, [ev.id]);

  function save() {
    onUpdate(draft);
    setEditing(false);
  }
  function cancel() {
    setDraft(ev);
    setEditing(false);
  }

  return (
    <div className="evt">
      <div className="evt-h">
        <div className="num">{idx + 1}</div>
        {editing ? (
          <div className="row" style={{ flex: 1, gap: 8 }}>
            <input type="date" className="in" style={{ width: 150 }}
              value={draft.date} onChange={e => setDraft({ ...draft, date: e.target.value })} />
            <input type="time" className="in" style={{ width: 110 }}
              value={draft.time} onChange={e => setDraft({ ...draft, time: e.target.value })} />
            <input type="text" className="in" placeholder="สถานที่ (เช่น ER, IPD ชาย)"
              value={draft.place} onChange={e => setDraft({ ...draft, place: e.target.value })}
              style={{ flex: 1, minWidth: 120 }} />
          </div>
        ) : (
          <div className="meta grow">
            <b>{thDate(ev.date)}</b> · <b>{ev.time || "—"}</b> น. · {ev.place || <span className="muted">ไม่ระบุสถานที่</span>}
          </div>
        )}
        <div style={{ display: "flex", gap: 4 }}>
          <button className="btn ghost sm" onClick={() => onMove(-1)} disabled={idx === 0} title="เลื่อนขึ้น">
            <Icon.ChevD size={14} style={{ transform: "rotate(180deg)" }} />
          </button>
          <button className="btn ghost sm" onClick={() => onMove(1)} disabled={idx === total - 1} title="เลื่อนลง">
            <Icon.ChevD size={14} />
          </button>
        </div>
      </div>
      <div className="evt-b">
        <label className="lbl">เหตุการณ์ที่เกิดขึ้น <span className="hint">(อาการ · ผลตรวจร่างกาย · Lab · การรักษา)</span></label>
        <textarea
          className="in"
          rows={editing ? 7 : 5}
          placeholder="บันทึกเหตุการณ์ที่เกิดขึ้นโดยละเอียด..."
          value={editing ? draft.text : ev.text}
          onChange={e => editing && setDraft({ ...draft, text: e.target.value })}
          readOnly={!editing}
          style={editing ? null : { background: "var(--ink-50)", color: "var(--ink-700)", whiteSpace: "pre-wrap" }}
        />
      </div>
      <div className="evt-actions">
        {editing ? (
          <React.Fragment>
            <button className="btn" onClick={save}><Icon.Save size={14} /> บันทึก</button>
            <button className="btn ghost" onClick={cancel}>ยกเลิก</button>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <button className="btn ghost" onClick={() => setEditing(true)}><Icon.Edit size={14} /> แก้ไข</button>
            <button className="btn danger" onClick={() => setConfirmDel(true)}><Icon.Trash size={14} /> ลบ</button>
          </React.Fragment>
        )}
      </div>
      {confirmDel && (
        <Confirm
          title="ยืนยันการลบเหตุการณ์"
          msg={`ลบเหตุการณ์ลำดับที่ ${idx + 1} เวลา ${ev.time || "—"} น. ใช่หรือไม่?`}
          danger
          onCancel={() => setConfirmDel(false)}
          onConfirm={() => { setConfirmDel(false); onDelete(); }}
        />
      )}
    </div>
  );
}

window.CaseForm = CaseForm;
