// case-list.jsx — Menu 3: Case list (card grid) with search/filter

function CaseList({ cases, users, onOpen, onNew, onDelete, currentUser }) {
  const [search, setSearch] = React.useState("");
  const [filterDept, setFilterDept] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [filterReason, setFilterReason] = React.useState("");
  const [confirmDel, setConfirmDel] = React.useState(null);

  const filtered = React.useMemo(() => {
    return cases.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        const hay = `${c.hn} ${c.diagnosis} ${c.reviewers} ${c.complications}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filterDept && c.department !== filterDept) return false;
      if (filterStatus && c.status !== filterStatus) return false;
      if (filterReason && !c.reasons.includes(filterReason)) return false;
      return true;
    });
  }, [cases, search, filterDept, filterStatus, filterReason]);

  function userName(id) {
    const u = users.find(x => x.id === id);
    return u ? u.name : "—";
  }

  return (
    <div>
      <div className="toolbar">
        <div className="search">
          <Icon.Search size={15} />
          <input placeholder="ค้นหาด้วย HN, การวินิจฉัย, ผู้ทบทวน..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="in" value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ width: 170, padding: "8px 12px" }}>
          <option value="">แผนกทั้งหมด</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="in" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 160, padding: "8px 12px" }}>
          <option value="">สถานะทั้งหมด</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="in" value={filterReason} onChange={e => setFilterReason(e.target.value)} style={{ width: 200, padding: "8px 12px" }}>
          <option value="">เหตุผลทบทวนทั้งหมด</option>
          {REVIEW_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button className="btn" onClick={onNew}><Icon.Plus size={14} /> เพิ่มเคสใหม่</button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div className="muted" style={{ fontSize: 13 }}>
          พบ <b style={{ color: "var(--ink-900)" }}>{filtered.length}</b> เคส
          {filtered.length !== cases.length && <span> จากทั้งหมด {cases.length} เคส</span>}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="ic"><Icon.FileText size={26} /></div>
            <h3>ยังไม่มีเคสที่ตรงเงื่อนไข</h3>
            <p>ลองปรับเงื่อนไขการค้นหา หรือเพิ่มเคสใหม่</p>
            <button className="btn" onClick={onNew}><Icon.Plus size={14} /> เพิ่มเคสใหม่</button>
          </div>
        </div>
      ) : (
        <div className="case-grid">
          {filtered.map(c => (
            <CaseCard
              key={c.id} c={c}
              ownerName={userName(c.createdBy)}
              onOpen={() => onOpen(c.id)}
              onDelete={() => setConfirmDel(c)}
            />
          ))}
        </div>
      )}

      {confirmDel && (
        <Confirm
          title="ยืนยันการลบเคส"
          msg={`ลบเคส HN ${confirmDel.hn} (${confirmDel.diagnosis.slice(0, 60)}...) ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
          danger
          onCancel={() => setConfirmDel(null)}
          onConfirm={() => { onDelete(confirmDel.id); setConfirmDel(null); }}
        />
      )}
    </div>
  );
}

function CaseCard({ c, ownerName, onOpen, onDelete }) {
  const status = STATUS[c.status] || STATUS.draft;
  const dept = c.department === "อื่นๆ" ? c.departmentOther : c.department;
  const isDeath = c.reasons.includes("เสียชีวิต");

  return (
    <div className="case-card" onClick={onOpen}>
      <div className="row" style={{ justifyContent: "space-between", gap: 8 }}>
        <span className="hn">HN {c.hn || "—"}</span>
        <span className={"pill " + status.pill} style={{ fontSize: 11 }}>
          {status.label}
        </span>
      </div>

      <h4>{c.diagnosis || <span className="muted" style={{ fontStyle: "italic", fontWeight: 500 }}>ยังไม่ระบุการวินิจฉัย</span>}</h4>

      <div className="meta">
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <span className="pill brand" style={{ fontSize: 11 }}>
            <Icon.Hospital size={11} /> {dept || "—"}
          </span>
          {isDeath && (
            <span className="pill err" style={{ fontSize: 11 }}>
              <Icon.AlertTri size={11} /> เสียชีวิต
            </span>
          )}
        </div>
        <div style={{ marginTop: 4 }}>
          <Icon.Calendar size={11} style={{ verticalAlign: "-1px", marginRight: 4 }} />
          Admit {thDate(c.admitDate)} → {c.dischargeDate ? thDate(c.dischargeDate) : <span className="muted">ยังไม่จำหน่าย</span>}
        </div>
        <div>
          <Icon.ClipboardCheck size={11} style={{ verticalAlign: "-1px", marginRight: 4 }} />
          ทบทวน {thDate(c.reviewDate)}
        </div>
      </div>

      <div className="foot">
        <span><Icon.User size={11} style={{ verticalAlign: "-1px", marginRight: 4 }} /> {ownerName}</span>
        <div style={{ display: "flex", gap: 4 }}>
          <button className="btn ghost sm" onClick={(e) => { e.stopPropagation(); onOpen(); }} title="ดู/แก้ไข">
            <Icon.Eye size={13} />
          </button>
          <button className="btn ghost sm" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="ลบ">
            <Icon.Trash size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

window.CaseList = CaseList;
