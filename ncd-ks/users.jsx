// Admin: User management — CRUD on staff/doctor/admin/exec accounts.

const UserManagement = ({ users, onChange, user: currentUser }) => {
  const { HOSPITALS } = window.NCD_DATA;
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editUser, setEditUser] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  if (currentUser.role !== "admin") {
    return (
      <div className="page">
        <Empty title="คุณไม่มีสิทธิ์เข้าถึงหน้านี้" icon="lock">หน้าจัดการผู้ใช้สำหรับ Admin เท่านั้น</Empty>
      </div>
    );
  }

  const filtered = useMemo(() => {
    let arr = users;
    if (roleFilter !== "all") arr = arr.filter((u) => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.hospital.toLowerCase().includes(q)
      );
    }
    return arr;
  }, [users, search, roleFilter]);

  const save = (u) => {
    if (!u.name.trim() || !u.username.trim()) { showToast("กรุณากรอกชื่อและ username", "error"); return; }
    if (u.id) onChange(users.map((x) => x.id === u.id ? u : x));
    else onChange([...users, { ...u, id: "u" + Math.random().toString(36).slice(2, 8), lastLogin: null, status: "active" }]);
    setEditUser(null); setShowAdd(false);
    showToast(u.id ? "บันทึกข้อมูลผู้ใช้แล้ว" : "เพิ่มผู้ใช้ใหม่เรียบร้อย", "success");
  };

  const remove = (id) => {
    if (!confirm("ต้องการลบผู้ใช้รายนี้ใช่หรือไม่?")) return;
    onChange(users.filter((u) => u.id !== id));
    showToast("ลบผู้ใช้แล้ว", "success");
  };

  const toggleStatus = (u) => {
    onChange(users.map((x) => x.id === u.id ? { ...x, status: x.status === "active" ? "inactive" : "active" } : x));
    showToast(u.status === "active" ? "ปิดใช้งานบัญชีนี้แล้ว" : "เปิดใช้งานบัญชีนี้แล้ว", "success");
  };

  const counts = {
    staff: users.filter((u) => u.role === "staff").length,
    doctor: users.filter((u) => u.role === "doctor").length,
    admin: users.filter((u) => u.role === "admin").length,
    exec: users.filter((u) => u.role === "exec").length,
  };

  const ROLE_LABELS = { staff: "เจ้าหน้าที่ รพ.สต.", doctor: "แพทย์/พยาบาล NCD", admin: "Admin", exec: "ผู้บริหาร" };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">จัดการผู้ใช้งาน</h1>
          <p className="page-subtitle">เพิ่ม ลบ แก้ไขบัญชีบุคลากร รพ.สต. และทีม NCD รพ.คอนสาร</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setShowAdd(true)}>
          <Icon name="plus" size={16} /> เพิ่มผู้ใช้ใหม่
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><div className="kpi-label">เจ้าหน้าที่ รพ.สต.</div><div className="kpi-value" style={{ color: "var(--blue-400)" }}>{counts.staff}</div></div>
        <div className="kpi"><div className="kpi-label">แพทย์/พยาบาล NCD</div><div className="kpi-value" style={{ color: "var(--mint-600)" }}>{counts.doctor}</div></div>
        <div className="kpi"><div className="kpi-label">Admin</div><div className="kpi-value" style={{ color: "#6B3DB0" }}>{counts.admin}</div></div>
        <div className="kpi"><div className="kpi-label">ผู้บริหาร</div><div className="kpi-value" style={{ color: "var(--amber-500)" }}>{counts.exec}</div></div>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <Icon name="search" size={16} className="search-icon" />
          <input className="input" placeholder="ค้นหาชื่อ, username, หรือหน่วยบริการ..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="segment">
          <button className={roleFilter === "all" ? "active" : ""} onClick={() => setRoleFilter("all")}>ทั้งหมด</button>
          <button className={roleFilter === "staff" ? "active" : ""} onClick={() => setRoleFilter("staff")}>รพ.สต.</button>
          <button className={roleFilter === "doctor" ? "active" : ""} onClick={() => setRoleFilter("doctor")}>แพทย์ NCD</button>
          <button className={roleFilter === "admin" ? "active" : ""} onClick={() => setRoleFilter("admin")}>Admin</button>
          <button className={roleFilter === "exec" ? "active" : ""} onClick={() => setRoleFilter("exec")}>ผู้บริหาร</button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>ชื่อ</th>
              <th>Username</th>
              <th>บทบาท</th>
              <th>หน่วยบริการ</th>
              <th>เข้าใช้ล่าสุด</th>
              <th>สถานะ</th>
              <th style={{ width: 140 }}>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8}><Empty title="ไม่พบผู้ใช้" icon="users" /></td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id}>
                <td><div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>{u.name.slice(0, 2)}</div></td>
                <td style={{ fontWeight: 500 }}>{u.name}</td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--ink-500)" }}>{u.username}</td>
                <td><span className={`role-badge ${u.role}`}><Icon name={u.role === "staff" ? "user" : u.role === "doctor" ? "stethoscope" : u.role === "admin" ? "shield" : "activity"} size={11} /> {ROLE_LABELS[u.role]}</span></td>
                <td style={{ fontSize: 12.5 }}>{u.hospital}</td>
                <td style={{ fontSize: 12.5 }}>{u.lastLogin ? relativeTime(u.lastLogin) : <span className="muted">ยังไม่เคย</span>}</td>
                <td>{u.status === "active" ? <span className="tag green">ใช้งาน</span> : <span className="tag gray">ปิด</span>}</td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => setEditUser(u)} title="แก้ไข"><Icon name="edit" size={13} /></button>
                    <button className="btn btn-sm btn-ghost" onClick={() => toggleStatus(u)} title={u.status === "active" ? "ปิดใช้งาน" : "เปิดใช้งาน"}>
                      <Icon name={u.status === "active" ? "lock" : "check"} size={13} />
                    </button>
                    <button className="btn btn-sm btn-ghost" onClick={() => remove(u.id)} title="ลบ" style={{ color: "var(--red-500)" }}><Icon name="trash" size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editUser || showAdd) && (
        <UserEditModal
          user={editUser || { name: "", username: "", role: "staff", hospital: HOSPITALS[0] }}
          onSave={save}
          onCancel={() => { setEditUser(null); setShowAdd(false); }}
        />
      )}
    </div>
  );
};

const UserEditModal = ({ user, onSave, onCancel }) => {
  const { HOSPITALS } = window.NCD_DATA;
  const [u, setU] = useState({ ...user });
  return (
    <Modal open={true} onClose={onCancel} title={u.id ? `แก้ไขผู้ใช้: ${user.name}` : "เพิ่มผู้ใช้ใหม่"}
      footer={<>
        <button className="btn btn-ghost" onClick={onCancel}>ยกเลิก</button>
        <button className="btn btn-primary" onClick={() => onSave(u)}><Icon name="save" size={14} /> บันทึก</button>
      </>}>
      <div style={{ display: "grid", gap: 12 }}>
        <div className="field">
          <label className="field-label">ชื่อ - นามสกุล <span className="req">*</span></label>
          <input className="input" value={u.name} onChange={(e) => setU({ ...u, name: e.target.value })} />
        </div>
        <div className="field">
          <label className="field-label">Username <span className="req">*</span></label>
          <input className="input" value={u.username} onChange={(e) => setU({ ...u, username: e.target.value })} placeholder="เช่น malee.tu" />
        </div>
        <div className="field">
          <label className="field-label">บทบาท</label>
          <div className="chip-group">
            {[
              { k: "staff", l: "เจ้าหน้าที่ รพ.สต." },
              { k: "doctor", l: "แพทย์/พยาบาล NCD" },
              { k: "admin", l: "Admin" },
              { k: "exec", l: "ผู้บริหาร" },
            ].map((r) => (
              <ChipRadio key={r.k} checked={u.role === r.k} onClick={() => setU({ ...u, role: r.k })}>{r.l}</ChipRadio>
            ))}
          </div>
        </div>
        <div className="field">
          <label className="field-label">หน่วยบริการ</label>
          <select className="select" value={u.hospital} onChange={(e) => setU({ ...u, hospital: e.target.value })}>
            <option value="รพ.คอนสาร">รพ.คอนสาร</option>
            {HOSPITALS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        {!u.id && (
          <div style={{ background: "var(--cream-100)", padding: 12, borderRadius: 8, fontSize: 12.5, color: "var(--ink-500)", display: "flex", gap: 8 }}>
            <Icon name="info" size={14} style={{ marginTop: 2 }} />
            <span>ระบบจะส่งรหัสผ่านเริ่มต้นไปให้ผู้ใช้ ผู้ใช้สามารถเปลี่ยนได้เองหลังเข้าใช้งานครั้งแรก</span>
          </div>
        )}
      </div>
    </Modal>
  );
};

window.UserManagement = UserManagement;
