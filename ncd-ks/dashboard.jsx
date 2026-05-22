// Dashboard: hero stats, filter bar, segmented status, case cards.

const Dashboard = ({ cases, user, onOpen, onNew }) => {
  const { HOSPITALS } = window.NCD_DATA;
  const [tab, setTab] = useState("all"); // all | pending | responded | urgent
  const [search, setSearch] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("ทั้งหมด");

  const visibleCases = useMemo(() => {
    // Staff only sees own hospital's cases
    let arr = cases;
    if (user.role === "staff") arr = arr.filter((c) => c.hospital === user.hospital);
    if (hospitalFilter !== "ทั้งหมด") arr = arr.filter((c) => c.hospital === hospitalFilter);
    if (tab === "pending") arr = arr.filter((c) => c.status === "pending");
    if (tab === "responded") arr = arr.filter((c) => c.status === "responded");
    if (tab === "urgent") arr = arr.filter((c) => c.urgent && c.status === "pending");
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((c) => (
        c.patient.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.hospital.toLowerCase().includes(q) ||
        (c.topics || []).some((t) => t.toLowerCase().includes(q))
      ));
    }
    return [...arr].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }, [cases, tab, search, hospitalFilter, user]);

  const counts = useMemo(() => {
    const scoped = user.role === "staff" ? cases.filter((c) => c.hospital === user.hospital) : cases;
    return {
      total: scoped.length,
      pending: scoped.filter((c) => c.status === "pending").length,
      responded: scoped.filter((c) => c.status === "responded").length,
      urgent: scoped.filter((c) => c.urgent && c.status === "pending").length,
      hospitals: new Set(scoped.map((c) => c.hospital)).size,
    };
  }, [cases, user]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div style={{ fontSize: 13, color: "var(--ink-500)", marginBottom: 4, display: "flex", gap: 6, alignItems: "center" }}>
            <span>สวัสดี, {user.name}</span>
            <span>·</span>
            <span>{user.hospital}</span>
          </div>
          <h1 className="page-title">หน้าหลัก</h1>
          <p className="page-subtitle">
            {user.role === "staff" ? "เคสปรึกษาที่ส่งจากหน่วยของท่าน" :
             user.role === "doctor" ? "เคสรอตอบกลับและประวัติการตอบกลับ" :
             user.role === "admin" ? "ภาพรวมเคสและข้อมูลดิบ" : "ภาพรวมระบบ คปสอ.คอนสาร"}
          </p>
        </div>
        {(user.role === "staff" || user.role === "doctor") && (
          <button className="btn btn-primary btn-lg" onClick={onNew}>
            <Icon name="plus" size={16} /> ส่งเคสปรึกษาใหม่
          </button>
        )}
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-icon" style={{ background: "var(--mint-100)", color: "var(--mint-600)" }}><Icon name="file-text" size={16} /></div>
          <div className="stat-label">เคสทั้งหมด</div>
          <div className="stat-value">{counts.total}</div>
          <div className="stat-sub">นับรวมในระบบ</div>
        </div>
        <div className="stat red">
          <div className="stat-icon"><Icon name="clock" size={16} /></div>
          <div className="stat-label">รอตอบกลับ</div>
          <div className="stat-value">{counts.pending}</div>
          <div className="stat-sub">{counts.urgent > 0 ? `🔥 เร่งด่วน ${counts.urgent} เคส` : "ไม่มีเคสเร่งด่วน"}</div>
        </div>
        <div className="stat green">
          <div className="stat-icon"><Icon name="check" size={16} /></div>
          <div className="stat-label">ตอบกลับแล้ว</div>
          <div className="stat-value">{counts.responded}</div>
          <div className="stat-sub">
            {counts.total > 0 ? `${Math.round((counts.responded/counts.total)*100)}% ของทั้งหมด` : "—"}
          </div>
        </div>
        <div className="stat mint">
          <div className="stat-icon"><Icon name="users" size={16} /></div>
          <div className="stat-label">รพ.สต. ที่ส่ง</div>
          <div className="stat-value">{counts.hospitals}</div>
          <div className="stat-sub">หน่วยบริการในเครือข่าย</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <Icon name="search" size={16} className="search-icon" />
          <input
            className="input"
            placeholder="ค้นหา: รหัสเคส, ชื่อผู้ป่วย, รพ.สต., ประเด็นปรึกษา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {user.role !== "staff" && (
          <select className="select" style={{ width: 200 }} value={hospitalFilter} onChange={(e) => setHospitalFilter(e.target.value)}>
            <option value="ทั้งหมด">ทุก รพ.สต.</option>
            {HOSPITALS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        )}

        <div className="segment">
          <button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>
            ทั้งหมด <span className="count">{counts.total}</span>
          </button>
          <button className={tab === "pending" ? "active" : ""} onClick={() => setTab("pending")}>
            <span className="status-dot red" /> รอตอบกลับ <span className="count">{counts.pending}</span>
          </button>
          <button className={tab === "responded" ? "active" : ""} onClick={() => setTab("responded")}>
            <span className="status-dot green" /> ตอบกลับแล้ว <span className="count">{counts.responded}</span>
          </button>
          {counts.urgent > 0 && (
            <button className={tab === "urgent" ? "active" : ""} onClick={() => setTab("urgent")}>
              <span className="status-dot amber" /> เร่งด่วน <span className="count">{counts.urgent}</span>
            </button>
          )}
        </div>
      </div>

      {visibleCases.length === 0 ? (
        <Empty title="ยังไม่มีเคสในรายการนี้" icon="file-text">
          ลองปรับตัวกรอง หรือกดปุ่ม "ส่งเคสปรึกษาใหม่" เพื่อเริ่มต้น
        </Empty>
      ) : (
        <div className="case-grid">
          {visibleCases.map((c) => <CaseCard key={c.id} c={c} onOpen={() => onOpen(c.id)} />)}
        </div>
      )}
    </div>
  );
};

const CaseCard = ({ c, onOpen }) => {
  const status = c.status === "responded" ? "responded" : (c.urgent ? "urgent" : "pending");
  return (
    <div className={`case-card ${status}`} onClick={onOpen}>
      <div className="case-top">
        <div>
          <div className="case-id">{c.id}</div>
          <div className="case-name">{c.patient}</div>
          <div className="case-meta">
            <span>อายุ {c.age} ปี</span>
            <span>·</span>
            <span><Icon name="hospital" size={11} style={{ verticalAlign: "-1px" }} /> {c.hospital.replace("รพ.สต.", "")}</span>
          </div>
        </div>
        {c.status === "responded" ? (
          <span className="tag green"><Icon name="check" size={10} /> ตอบกลับแล้ว</span>
        ) : c.urgent ? (
          <span className="tag amber"><Icon name="alert" size={10} /> เร่งด่วน</span>
        ) : (
          <span className="tag red">รอตอบกลับ</span>
        )}
      </div>

      <div style={{ marginTop: 10, fontSize: 13, color: "var(--ink-700)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {c.note}
      </div>

      <div className="case-topics">
        {(c.diseases || []).slice(0, 3).map((d) => <span key={d} className="tag">{d}</span>)}
        {(c.topics || []).slice(0, 1).map((t) => <span key={t} className="tag" style={{ background: "var(--blue-50)", color: "var(--blue-400)", borderColor: "#D1E4F1" }}>{t}</span>)}
      </div>

      <div className="case-foot">
        <span>{c.submittedBy} · {relativeTime(c.submittedAt)}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--mint-600)", fontWeight: 500 }}>
          เปิดดู <Icon name="chevron-right" size={12} />
        </span>
      </div>
    </div>
  );
};

window.Dashboard = Dashboard;
