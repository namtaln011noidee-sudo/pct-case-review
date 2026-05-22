// Menu 1: ลงบันทึกข้อมูลที่ต้องการปรึกษา
// Sections:
//   1) ข้อมูลผู้ป่วย (ชื่อ-สกุล, อายุ, รพ.สต.)
//   2) โรคประจำตัว
//   3) ประเด็นที่ต้องการปรึกษา
//   4) ข้อมูลเพิ่มเติม + อัพโหลด/ถ่ายรูป
//   5) ยาที่ใช้ปัจจุบัน (เบาหวาน, ความดัน, ไขมัน)

const blankCase = (user) => ({
  id: "CSL-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 9000) + 1000),
  patient: "",
  age: "",
  hospital: user.role === "staff" ? user.hospital : "",
  hospitalOther: "",
  diseases: [],
  diseasesOther: "",
  ckdStage: "",
  topics: [],
  topicsOther: "",
  note: "",
  images: [],
  meds: { diabetes: [], hypertension: [], lipid: [] },
  urgent: false,
  submittedBy: user.name,
  submittedFrom: user.hospital,
  submittedAt: new Date().toISOString(),
  status: "pending",
  response: null,
});

const CaseForm = ({ user, existing, onSave, onCancel }) => {
  const { HOSPITALS, DISEASES, CKD_STAGES, CONSULT_TOPICS } = window.NCD_DATA;
  const [form, setForm] = useState(existing || blankCase(user));
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k, item) => setForm((f) => ({
    ...f, [k]: f[k].includes(item) ? f[k].filter((x) => x !== item) : [...f[k], item],
  }));

  const isOtherHospital = !HOSPITALS.includes(form.hospital);

  const submit = () => {
    if (!form.patient.trim()) { showToast("กรุณากรอกชื่อ-นามสกุล", "error"); return; }
    if (!form.age) { showToast("กรุณากรอกอายุ", "error"); return; }
    if (!form.hospital && !form.hospitalOther) { showToast("กรุณาเลือก รพ.สต.", "error"); return; }
    if (!form.topics.length && !form.topicsOther.trim()) { showToast("กรุณาเลือกประเด็นที่ต้องการปรึกษา", "error"); return; }
    onSave({
      ...form,
      hospital: isOtherHospital ? form.hospitalOther : form.hospital,
      submittedAt: existing ? form.submittedAt : new Date().toISOString(),
    });
    showToast(existing ? "บันทึกการแก้ไขเรียบร้อย" : "ส่งเคสปรึกษาเรียบร้อย", "success");
  };

  return (
    <div className="page">
      <button className="btn btn-ghost btn-sm" onClick={onCancel} style={{ marginBottom: 12 }}>
        <Icon name="arrow-left" size={14} /> กลับหน้าหลัก
      </button>

      <div className="page-head">
        <div>
          <h1 className="page-title">{existing ? "แก้ไขเคสปรึกษา" : "ลงบันทึกเคสปรึกษาใหม่"}</h1>
          <p className="page-subtitle">รหัสเคส: <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-700)" }}>{form.id}</span> · บันทึกโดย {user.name}</p>
        </div>
        <div className="row-inline">
          <ChipCheck checked={form.urgent} onClick={() => set("urgent", !form.urgent)}>
            <Icon name="alert" size={12} style={{ color: "var(--amber-500)" }} /> ทำเครื่องหมายเร่งด่วน
          </ChipCheck>
        </div>
      </div>

      <div className="section-grid">
        {/* ---------- Section 1: ข้อมูลผู้ป่วย ---------- */}
        <div className="card card-pad-lg">
          <div className="card-head">
            <h3 className="card-title"><span className="num">1</span> ข้อมูลผู้ป่วย</h3>
          </div>
          <div className="row row-3">
            <div className="field">
              <label className="field-label">ชื่อ - นามสกุล <span className="req">*</span></label>
              <input className="input" placeholder="เช่น นางสมหญิง ใจดี" value={form.patient} onChange={(e) => set("patient", e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">อายุ (ปี) <span className="req">*</span></label>
              <input type="number" className="input" placeholder="65" value={form.age} onChange={(e) => set("age", e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">รพ.สต. <span className="req">*</span></label>
              <select className="select" value={isOtherHospital ? "อื่นๆ" : form.hospital}
                onChange={(e) => set("hospital", e.target.value === "อื่นๆ" ? "" : e.target.value)}>
                <option value="">— เลือก รพ.สต. —</option>
                {HOSPITALS.map((h) => <option key={h} value={h}>{h}</option>)}
                <option value="อื่นๆ">อื่นๆ (ระบุ)</option>
              </select>
              {isOtherHospital && (
                <input className="input input-sm" placeholder="ระบุชื่อหน่วยบริการ" value={form.hospitalOther} onChange={(e) => set("hospitalOther", e.target.value)} />
              )}
            </div>
          </div>
        </div>

        {/* ---------- Section 2: โรคประจำตัว ---------- */}
        <div className="card card-pad-lg">
          <div className="card-head">
            <h3 className="card-title"><span className="num">2</span> โรคประจำตัว</h3>
            <span className="muted" style={{ fontSize: 12 }}>เลือกได้มากกว่า 1 รายการ</span>
          </div>
          <div className="chip-group">
            {DISEASES.map((d) => (
              <ChipCheck key={d} checked={form.diseases.includes(d)} onClick={() => toggle("diseases", d)}>{d}</ChipCheck>
            ))}
          </div>
          {form.diseases.includes("ไตเสื่อม") && (
            <div className="field" style={{ marginTop: 12 }}>
              <label className="field-label">ระบุระยะ CKD</label>
              <div className="chip-group">
                {CKD_STAGES.map((s) => (
                  <ChipRadio key={s} checked={form.ckdStage === s} onClick={() => set("ckdStage", s)}>{s}</ChipRadio>
                ))}
              </div>
            </div>
          )}
          <div className="field" style={{ marginTop: 12 }}>
            <label className="field-label">อื่นๆ</label>
            <input className="input" placeholder="โรคประจำตัวอื่นๆ (ถ้ามี)" value={form.diseasesOther} onChange={(e) => set("diseasesOther", e.target.value)} />
          </div>
        </div>

        {/* ---------- Section 3: ประเด็นปรึกษา ---------- */}
        <div className="card card-pad-lg">
          <div className="card-head">
            <h3 className="card-title"><span className="num">3</span> ประเด็นที่ต้องการปรึกษา <span className="req">*</span></h3>
          </div>
          <div className="chip-group">
            {CONSULT_TOPICS.map((t) => (
              <ChipCheck key={t} checked={form.topics.includes(t)} onClick={() => toggle("topics", t)}>{t}</ChipCheck>
            ))}
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label className="field-label">อื่นๆ (ระบุ)</label>
            <input className="input" placeholder="ประเด็นปรึกษาอื่นๆ" value={form.topicsOther} onChange={(e) => set("topicsOther", e.target.value)} />
          </div>
        </div>

        {/* ---------- Section 4: ข้อมูลเพิ่มเติม + รูปภาพ ---------- */}
        <div className="card card-pad-lg">
          <div className="card-head">
            <h3 className="card-title"><span className="num">4</span> ข้อมูลเพิ่มเติม</h3>
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label className="field-label">รายละเอียดเพิ่มเติม</label>
            <textarea
              className="textarea" rows="4"
              placeholder="ระบุอาการ ผลแลป ค่าน้ำตาล/ความดัน ที่ผ่านมา หรือคำถามถึงทีมแพทย์..."
              value={form.note} onChange={(e) => set("note", e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label">รูปภาพประกอบ (ผลแลป, BP/SMBG log, ฉลากยา ฯลฯ)</label>
            <ImageUploader images={form.images} onChange={(imgs) => set("images", imgs)} />
          </div>
        </div>

        {/* ---------- Section 5: ยาที่ใช้ปัจจุบัน ---------- */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span className="num" style={{ width: 24, height: 24, borderRadius: 8, background: "var(--mint-100)", color: "var(--mint-700)", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700 }}>5</span>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>ยาที่ใช้ปัจจุบัน</h3>
            <span className="muted" style={{ fontSize: 12 }}>เลือกยาที่ผู้ป่วยรับประทานอยู่ และระบุวิธีใช้</span>
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            <MedPicker category="diabetes"    value={form.meds.diabetes}    onChange={(v) => set("meds", { ...form.meds, diabetes: v })}    label="ยาเบาหวาน" />
            <MedPicker category="hypertension" value={form.meds.hypertension} onChange={(v) => set("meds", { ...form.meds, hypertension: v })} label="ยาความดัน" />
            <MedPicker category="lipid"       value={form.meds.lipid}       onChange={(v) => set("meds", { ...form.meds, lipid: v })}       label="ยาไขมัน" />
          </div>
        </div>
      </div>

      {/* Sticky footer actions */}
      <div style={{
        position: "sticky", bottom: 0, marginTop: 24,
        background: "linear-gradient(180deg, transparent 0%, var(--cream-50) 50%)",
        padding: "20px 0",
        display: "flex", justifyContent: "flex-end", gap: 8,
      }}>
        <button className="btn btn-ghost btn-lg" onClick={onCancel}>ยกเลิก</button>
        <button className="btn btn-primary btn-lg" onClick={submit}>
          <Icon name="send" size={16} /> {existing ? "บันทึกการแก้ไข" : "ส่งเคสปรึกษา"}
        </button>
      </div>
    </div>
  );
};

window.CaseForm = CaseForm;
window.blankCase = blankCase;
