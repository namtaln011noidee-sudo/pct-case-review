// Knowledge base — CPG and drug side-effect articles. List → detail.

const Knowledge = () => {
  const { KNOWLEDGE_ARTICLES } = window.NCD_DATA;
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("ทั้งหมด");
  const [openId, setOpenId] = useState(null);

  const cats = ["ทั้งหมด", ...new Set(KNOWLEDGE_ARTICLES.map((a) => a.category))];

  const filtered = useMemo(() => {
    let arr = KNOWLEDGE_ARTICLES;
    if (cat !== "ทั้งหมด") arr = arr.filter((a) => a.category === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.sections.some((s) => s.body.toLowerCase().includes(q))
      );
    }
    return arr;
  }, [KNOWLEDGE_ARTICLES, search, cat]);

  if (openId) {
    const a = KNOWLEDGE_ARTICLES.find((x) => x.id === openId);
    return (
      <div className="page">
        <button className="btn btn-ghost btn-sm" onClick={() => setOpenId(null)} style={{ marginBottom: 16 }}>
          <Icon name="arrow-left" size={14} /> กลับคลังความรู้
        </button>
        <article className="kb-article">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 999, background: "var(--mint-50)", color: "var(--mint-700)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
            <Icon name={a.icon} size={13} /> {a.category}
          </div>
          <h2>{a.title}</h2>
          <div className="kb-meta">อัพเดตล่าสุด: {thaiDate(a.updated + "T00:00:00", false)}</div>
          <p style={{ fontSize: 15, fontWeight: 500, color: "var(--ink-900)", padding: 14, background: "var(--cream-100)", borderRadius: 10, marginBottom: 14, lineHeight: 1.55 }}>
            {a.summary}
          </p>
          {a.sections.map((s, i) => (
            <div key={i}>
              <h3>{s.h}</h3>
              <p>{s.body}</p>
            </div>
          ))}
          <div style={{ marginTop: 24, padding: 12, background: "var(--cream-100)", borderRadius: 8, fontSize: 12.5, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <Icon name="info" size={14} style={{ color: "var(--mint-600)", marginTop: 2 }} />
            <span style={{ lineHeight: 1.5, color: "var(--ink-700)" }}>
              เอกสารนี้สรุปจากแนวทางเวชปฏิบัติเพื่อใช้เป็นข้อมูลเบื้องต้น — กรุณาใช้วิจารณญาณทางการแพทย์ของแพทย์ผู้รักษาเป็นหลัก หากมีข้อสงสัย ส่งเคสปรึกษาทีม NCD รพ.คอนสาร
            </span>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">คลังความรู้</h1>
          <p className="page-subtitle">แนวทางเวชปฏิบัติ NCD และข้อมูลอาการข้างเคียงยา สำหรับเจ้าหน้าที่ในเครือข่าย</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <Icon name="search" size={16} className="search-icon" />
          <input className="input" placeholder="ค้นหาความรู้, ชื่อยา, อาการ..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="segment" style={{ flexWrap: "wrap" }}>
          {cats.map((c) => (
            <button key={c} className={cat === c ? "active" : ""} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <span className="muted" style={{ fontSize: 13, marginLeft: "auto" }}>{filtered.length} บทความ</span>
      </div>

      {filtered.length === 0 ? (
        <Empty title="ไม่พบเอกสาร" icon="file-text">ลองปรับคำค้นหา</Empty>
      ) : (
        <div className="kb-grid">
          {filtered.map((a) => (
            <div key={a.id} className="kb-card" onClick={() => setOpenId(a.id)}>
              <div className="kb-icon"><Icon name={a.icon} size={18} /></div>
              <div className="kb-cat">{a.category}</div>
              <div className="kb-title">{a.title}</div>
              <div className="kb-summary">{a.summary}</div>
              <div className="kb-foot">
                <span>อัพเดต {thaiDate(a.updated + "T00:00:00", false)}</span>
                <span style={{ color: "var(--mint-600)", display: "flex", alignItems: "center", gap: 3 }}>
                  อ่าน <Icon name="chevron-right" size={11} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

window.Knowledge = Knowledge;
