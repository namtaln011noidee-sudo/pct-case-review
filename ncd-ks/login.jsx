// Login: เลือก รพ.สต. + รหัสผ่าน. Role-aware so test accounts can switch into the doctor / admin / executive view.

const Login = ({ onLogin }) => {
  const { HOSPITALS } = window.NCD_DATA;
  const [hospital, setHospital] = useState(HOSPITALS[0]);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const ROLES = [
    { key: "staff",    name: "เจ้าหน้าที่ รพ.สต.",     icon: "user",         desc: "ส่งเคสปรึกษา" },
    { key: "doctor",   name: "แพทย์/พยาบาล NCD",     icon: "stethoscope",  desc: "ตอบกลับเคสปรึกษา" },
    { key: "admin",    name: "Admin",                  icon: "shield",       desc: "ดู raw data & export" },
    { key: "exec",     name: "ผู้บริหาร",              icon: "activity",     desc: "ดูภาพรวมและสถิติ" },
  ];

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (!password) { setError("กรุณากรอกรหัสผ่าน"); return; }
    if (password.length < 4) { setError("รหัสผ่านสั้นเกินไป"); return; }
    setBusy(true);
    // Simulate a brief network call.
    setTimeout(() => {
      onLogin({
        role,
        hospital: role === "staff" ? hospital : "รพ.คอนสาร",
        name: role === "staff" ? `จนท. ${hospital.replace("รพ.สต.", "")}` :
              role === "doctor" ? "นพ.วรพล สิทธิ์โชค" :
              role === "admin" ? "ผู้ดูแลระบบ" : "ผอ.รพ.คอนสาร",
      });
      setBusy(false);
    }, 350);
  };

  return (
    <div className="login-shell">
      <div className="login-art">
        <div>
          <div className="badge"><Icon name="hospital" size={14} /> คปสอ.คอนสาร</div>
          <h1 style={{ marginTop: 20 }}>
            ปรึกษาเคส NCD<br />
            <span style={{ color: "var(--mint-600)" }}>จาก รพ.สต. ถึง รพ.คอนสาร</span>
          </h1>
          <p style={{ marginTop: 16 }}>
            ระบบส่ง-ตอบกลับข้อมูลผู้ป่วยโรคเรื้อรัง (เบาหวาน, ความดัน, ไขมัน, ไตเสื่อม)
            สำหรับเจ้าหน้าที่ รพ.สต. ในเครือคปสอ.คอนสาร และทีม NCD clinic
          </p>
        </div>

        <div className="feat-list">
          <div className="feat">
            <div className="feat-icon"><Icon name="send" size={18} /></div>
            <div className="feat-text">
              <strong>ส่งเคสปรึกษาได้ทันที</strong>
              <span>กรอกข้อมูล อัพโหลดรูปผลแลป BP log แล้วส่งให้แพทย์ทบทวน</span>
            </div>
          </div>
          <div className="feat">
            <div className="feat-icon"><Icon name="stethoscope" size={18} /></div>
            <div className="feat-text">
              <strong>แพทย์ตอบกลับด้วย template</strong>
              <span>เลือกแผนการรักษา ปรับยา นัดติดตาม พร้อมส่งสรุปแบบ document</span>
            </div>
          </div>
          <div className="feat">
            <div className="feat-icon"><Icon name="table" size={18} /></div>
            <div className="feat-text">
              <strong>Raw data export ได้</strong>
              <span>ดูสถิติภาพรวม กรองตาม รพ.สต. ส่งออก Excel / CSV ได้</span>
            </div>
          </div>
        </div>

        <div className="scribble">
          <svg width="280" height="200" viewBox="0 0 280 200" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 160 Q 40 100, 70 140 T 130 110 T 190 130 T 270 90" />
            <circle cx="70" cy="140" r="3" fill="currentColor" />
            <circle cx="130" cy="110" r="3" fill="currentColor" />
            <circle cx="190" cy="130" r="3" fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="login-card-wrap">
        <form className="login-card" onSubmit={submit}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div className="brand-mark" style={{ width: 44, height: 44 }}><Icon name="heart-pulse" size={22} /></div>
            <div>
              <h2>เข้าสู่ระบบ</h2>
              <div className="sub" style={{ marginBottom: 0 }}>Consult NCD KS · คปสอ.คอนสาร</div>
            </div>
          </div>

          <div className="field" style={{ marginBottom: 14 }}>
            <label className="field-label">บทบาท</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {ROLES.map((r) => (
                <button key={r.key} type="button"
                  onClick={() => setRole(r.key)}
                  style={{
                    border: `1.5px solid ${role === r.key ? "var(--mint-500)" : "var(--ink-100)"}`,
                    background: role === r.key ? "var(--mint-50)" : "white",
                    color: role === r.key ? "var(--mint-700)" : "var(--ink-700)",
                    padding: "10px 12px",
                    borderRadius: 10,
                    textAlign: "left",
                    display: "flex", alignItems: "center", gap: 10,
                    fontSize: 13, fontWeight: 500,
                  }}>
                  <Icon name={r.icon} size={16} />
                  <span style={{ display: "block", lineHeight: 1.2 }}>
                    {r.name}
                    <span style={{ display: "block", fontSize: 11, color: "var(--ink-500)", fontWeight: 400, marginTop: 2 }}>{r.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {role === "staff" && (
            <div className="field" style={{ marginBottom: 14 }}>
              <label className="field-label">รพ.สต. <span className="req">*</span></label>
              <select className="select" value={hospital} onChange={(e) => setHospital(e.target.value)}>
                {HOSPITALS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          )}

          <div className="field" style={{ marginBottom: 8 }}>
            <label className="field-label">รหัสผ่าน <span className="req">*</span></label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                className="input"
                style={{ paddingLeft: 38 }}
                placeholder="ใส่รหัสผ่านอย่างน้อย 4 ตัวอักษร"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <Icon name="lock" size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-400)" }} />
            </div>
          </div>

          {error && (
            <div style={{ background: "var(--red-50)", color: "var(--red-600)", padding: "8px 12px", borderRadius: 8, fontSize: 13, marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
              <Icon name="alert" size={14} /> {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} disabled={busy}>
            {busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            {!busy && <Icon name="chevron-right" size={16} />}
          </button>

          <div style={{ marginTop: 14, padding: 10, background: "var(--cream-100)", borderRadius: 8, fontSize: 12, color: "var(--ink-500)", display: "flex", gap: 8 }}>
            <Icon name="info" size={14} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>นี่คือต้นแบบสาธิต — ใช้รหัสผ่านอะไรก็ได้ (อย่างน้อย 4 ตัว) เพื่อเข้าใช้งาน</div>
          </div>
        </form>
      </div>
    </div>
  );
};

window.Login = Login;
