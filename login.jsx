// login.jsx — Login + Register screen

function LoginScreen({ store, onToast }) {
  const [mode, setMode] = React.useState("login"); // login | register
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("user");
  const [dept, setDept] = React.useState("");
  const [err, setErr] = React.useState("");

  const [busy, setBusy] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (mode === "login") {
        const r = await store.login(email, pw);
        if (!r.ok) setErr(r.error);
        else onToast("เข้าสู่ระบบสำเร็จ");
      } else {
        if (!name || !email || !pw) { setErr("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }
        if (pw.length < 6) { setErr("รหัสผ่านอย่างน้อย 6 ตัวอักษร"); return; }
        const r = await store.register({ name, email, pw, role, dept });
        if (!r.ok) setErr(r.error);
        else if (r.needConfirm) {
          // Supabase requires email confirmation — account created, not yet logged in
          setErr("");
          setMode("login");
          onToast("สร้างบัญชีสำเร็จ! กรุณายืนยันอีเมลแล้วกลับมาเข้าสู่ระบบ");
        } else {
          onToast("ลงทะเบียนสำเร็จ");
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-hero">
        <div className="brandblock">
          <Icon.Logo size={44} />
          <div>
            <div className="name">PCT Case Review</div>
            <div className="sub">โรงพยาบาลคอนสาร · จังหวัดชัยภูมิ</div>
          </div>
        </div>

        <div>
          <h1>ระบบทบทวน<br />คุณภาพการดูแลผู้ป่วย</h1>
          <p className="lead">
            บันทึก วิเคราะห์ และเรียนรู้จากเคสร่วมกัน เพื่อยกระดับความปลอดภัยและคุณภาพการดูแลผู้ป่วยอย่างต่อเนื่อง
          </p>

          <div className="feats">
            <div className="feat">
              <div className="ic"><Icon.ClipboardCheck size={16} /></div>
              <div>
                <b>บันทึกเคสเป็นระบบ</b>
                <span>ข้อมูลผู้ป่วย เหตุการณ์ จุดแข็ง จุดอ่อน ครบในที่เดียว</span>
              </div>
            </div>
            <div className="feat">
              <div className="ic"><Icon.Activity size={16} /></div>
              <div>
                <b>วิเคราะห์ Root cause</b>
                <span>คน วิธี ทรัพยากร สิ่งแวดล้อม นโยบาย อุปกรณ์</span>
              </div>
            </div>
            <div className="feat">
              <div className="ic"><Icon.BarChart size={16} /></div>
              <div>
                <b>Dashboard เห็นภาพรวม</b>
                <span>สรุปแนวโน้ม และติดตามมาตรการแก้ไขแบบ real-time</span>
              </div>
            </div>
            <div className="feat">
              <div className="ic"><Icon.Shield size={16} /></div>
              <div>
                <b>ปลอดภัย & แยกระดับสิทธิ์</b>
                <span>ผู้ใช้ทั่วไป หัวหน้าหน่วย ผู้ดูแลระบบ</span>
              </div>
            </div>
          </div>
        </div>

        <div className="foot">© 2569 Patient Care Team — โรงพยาบาลคอนสาร</div>
      </div>

      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <h2>{mode === "login" ? "เข้าสู่ระบบ" : "ลงทะเบียนสมาชิก"}</h2>
          <p className="sub">
            {mode === "login" ? "สำหรับเจ้าหน้าที่ผู้ทบทวนเคส" : "กรอกข้อมูลเพื่อสร้างบัญชีใหม่"}
          </p>

          <div className="tabs">
            <button type="button" className={mode === "login" ? "on" : ""} onClick={() => { setMode("login"); setErr(""); }}>เข้าสู่ระบบ</button>
            <button type="button" className={mode === "register" ? "on" : ""} onClick={() => { setMode("register"); setErr(""); }}>ลงทะเบียน</button>
          </div>

          <div className="stack">
            {mode === "register" && (
              <div className="field">
                <label>ชื่อ-นามสกุล <span className="req">*</span></label>
                <input className="in" placeholder="เช่น นพ.สมชาย ใจดี" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div className="field">
              <label>อีเมล <span className="req">*</span></label>
              <input className="in" type="email" placeholder="name@konsan.go.th" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>รหัสผ่าน <span className="req">*</span></label>
              <input className="in" type="password" placeholder="อย่างน้อย 6 ตัวอักษร" value={pw} onChange={e => setPw(e.target.value)} />
            </div>

            {mode === "register" && (
              <React.Fragment>
                <div className="field">
                  <label>หน่วยงาน</label>
                  <select className="in" value={dept} onChange={e => setDept(e.target.value)}>
                    <option value="">— เลือกหน่วยงาน —</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>ระดับสิทธิ์</label>
                  <div className="chips">
                    {ROLES.map(r => (
                      <button
                        type="button"
                        key={r.key}
                        className={"chip" + (role === r.key ? " on" : "")}
                        onClick={() => setRole(r.key)}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <span className="hint">{ROLES.find(r => r.key === role)?.desc}</span>
                </div>
              </React.Fragment>
            )}

            {err && <div className="err">{err}</div>}

            <button className="btn lg" type="submit" style={{ width: "100%" }} disabled={busy}>
              {busy ? "กรุณารอสักครู่…" : (mode === "login" ? "เข้าสู่ระบบ" : "สร้างบัญชี")}
              {!busy && <Icon.ArrowR size={15} />}
            </button>
          </div>

          <div className="switch">
            {mode === "login" ? (
              <React.Fragment>ยังไม่มีบัญชี? <a onClick={() => setMode("register")}>ลงทะเบียนที่นี่</a></React.Fragment>
            ) : (
              <React.Fragment>มีบัญชีแล้ว? <a onClick={() => setMode("login")}>เข้าสู่ระบบ</a></React.Fragment>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
