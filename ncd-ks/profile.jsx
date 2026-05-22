// Profile / Settings page.

const Profile = ({ user, onUpdate, onLogout, onSwitchRole, cases }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [pw, setPw] = useState({ cur: "", next: "", confirm: "" });

  const ROLE_LABELS = { staff: "เจ้าหน้าที่ รพ.สต.", doctor: "แพทย์/พยาบาล NCD", admin: "Admin", exec: "ผู้บริหาร" };

  const stats = useMemo(() => {
    if (user.role === "staff") {
      const own = cases.filter((c) => c.hospital === user.hospital);
      return [
        { label: "เคสที่ส่งทั้งหมด", value: own.length },
        { label: "ตอบกลับแล้ว", value: own.filter((c) => c.status === "responded").length },
        { label: "รอตอบกลับ", value: own.filter((c) => c.status === "pending").length },
      ];
    }
    if (user.role === "doctor") {
      const my = cases.filter((c) => c.response?.responder?.includes(user.name.split(" ")[0]) || c.status === "responded");
      return [
        { label: "เคสที่ตอบกลับ", value: cases.filter((c) => c.status === "responded").length },
        { label: "รอตอบกลับในระบบ", value: cases.filter((c) => c.status === "pending").length },
      ];
    }
    return [
      { label: "เคสทั้งหมดในระบบ", value: cases.length },
      { label: "ตอบกลับแล้ว", value: cases.filter((c) => c.status === "responded").length },
      { label: "รอตอบกลับ", value: cases.filter((c) => c.status === "pending").length },
    ];
  }, [user, cases]);

  const saveName = () => {
    if (!name.trim()) { showToast("กรุณากรอกชื่อ", "error"); return; }
    onUpdate({ ...user, name });
    setEditing(false);
    showToast("บันทึกข้อมูลส่วนตัวแล้ว", "success");
  };

  const changePw = () => {
    if (!pw.cur || !pw.next) { showToast("กรอกข้อมูลให้ครบ", "error"); return; }
    if (pw.next.length < 4) { showToast("รหัสผ่านใหม่สั้นเกินไป", "error"); return; }
    if (pw.next !== pw.confirm) { showToast("รหัสผ่านใหม่ไม่ตรงกัน", "error"); return; }
    setPw({ cur: "", next: "", confirm: "" });
    showToast("เปลี่ยนรหัสผ่านเรียบร้อย (สาธิต)", "success");
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">โปรไฟล์และการตั้งค่า</h1>
          <p className="page-subtitle">จัดการข้อมูลส่วนตัว รหัสผ่าน และการเข้าใช้งาน</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* LEFT: Profile hero + stats */}
        <div style={{ display: "grid", gap: 16 }}>
          <div className="profile-hero">
            <div className="big-avatar">{user.name.slice(0, 2)}</div>
            <h3>{user.name}</h3>
            <p>{ROLE_LABELS[user.role]} · {user.hospital}</p>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.2)", display: "grid", gap: 8 }}>
              {stats.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                  <span style={{ opacity: 0.85 }}>{s.label}</span>
                  <strong style={{ fontSize: 16 }}>{s.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-pad">
            <h3 className="card-title" style={{ marginBottom: 12 }}><Icon name="sparkle" size={14} /> โหมดสาธิต</h3>
            <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, marginBottom: 10 }}>
              คุณสามารถสลับบทบาทเพื่อดูมุมมองต่างๆ ของระบบ
            </p>
            <div style={{ display: "grid", gap: 6 }}>
              {["staff", "doctor", "admin", "exec"].map((r) => (
                <button key={r} className="btn btn-sm" style={{
                  justifyContent: "flex-start",
                  background: user.role === r ? "var(--mint-100)" : "var(--ink-100)",
                  color: user.role === r ? "var(--mint-700)" : "var(--ink-700)",
                  fontWeight: user.role === r ? 600 : 400,
                }} onClick={() => onSwitchRole(r)} disabled={user.role === r}>
                  <Icon name={r === "staff" ? "user" : r === "doctor" ? "stethoscope" : r === "admin" ? "shield" : "activity"} size={12} />
                  {ROLE_LABELS[r]}
                  {user.role === r && <span style={{ marginLeft: "auto", fontSize: 11 }}>· ปัจจุบัน</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Forms */}
        <div style={{ display: "grid", gap: 16 }}>
          <div className="card card-pad-lg">
            <div className="card-head">
              <h3 className="card-title"><Icon name="user" size={14} /> ข้อมูลส่วนตัว</h3>
              {!editing && <button className="btn btn-sm btn-ghost" onClick={() => setEditing(true)}><Icon name="edit" size={12} /> แก้ไข</button>}
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div className="field">
                <label className="field-label">ชื่อ - นามสกุล</label>
                {editing ? (
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                ) : (
                  <div style={{ padding: "10px 12px", background: "var(--cream-50)", borderRadius: 10, fontSize: 14 }}>{user.name}</div>
                )}
              </div>
              <div className="field">
                <label className="field-label">บทบาท</label>
                <div style={{ padding: "10px 12px", background: "var(--cream-50)", borderRadius: 10, fontSize: 14 }}>
                  <span className={`role-badge ${user.role}`}>{ROLE_LABELS[user.role]}</span>
                </div>
              </div>
              <div className="field">
                <label className="field-label">หน่วยบริการ</label>
                <div style={{ padding: "10px 12px", background: "var(--cream-50)", borderRadius: 10, fontSize: 14 }}>{user.hospital}</div>
              </div>
              {editing && (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button className="btn btn-ghost" onClick={() => { setName(user.name); setEditing(false); }}>ยกเลิก</button>
                  <button className="btn btn-primary" onClick={saveName}><Icon name="save" size={14} /> บันทึก</button>
                </div>
              )}
            </div>
          </div>

          <div className="card card-pad-lg">
            <div className="card-head">
              <h3 className="card-title"><Icon name="lock" size={14} /> เปลี่ยนรหัสผ่าน</h3>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div className="field">
                <label className="field-label">รหัสผ่านปัจจุบัน</label>
                <input type="password" className="input" value={pw.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} />
              </div>
              <div className="row row-2">
                <div className="field">
                  <label className="field-label">รหัสผ่านใหม่</label>
                  <input type="password" className="input" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label">ยืนยันรหัสผ่านใหม่</label>
                  <input type="password" className="input" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn btn-primary" onClick={changePw}><Icon name="check" size={14} /> เปลี่ยนรหัสผ่าน</button>
              </div>
            </div>
          </div>

          <div className="card card-pad-lg" style={{ background: "var(--red-50)", borderColor: "var(--red-100)" }}>
            <h3 className="card-title" style={{ color: "var(--red-600)" }}><Icon name="log-out" size={14} /> ออกจากระบบ</h3>
            <p className="muted" style={{ fontSize: 13, margin: "8px 0 12px" }}>ออกจากระบบบัญชีนี้ในเครื่องนี้</p>
            <button className="btn btn-danger" onClick={onLogout}><Icon name="log-out" size={14} /> ออกจากระบบ</button>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Profile = Profile;
