// Patient History — group cases by (patient + age + hospital) and show a timeline of consults.

const Patients = ({ cases, user, onOpen }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const patients = useMemo(() => {
    const map = new Map();
    const scope = user.role === "staff" ? cases.filter((c) => c.hospital === user.hospital) : cases;
    scope.forEach((c) => {
      const key = `${c.patient}__${c.age}__${c.hospital}`;
      if (!map.has(key)) map.set(key, { key, name: c.patient, age: c.age, hospital: c.hospital, cases: [], diseases: new Set() });
      const p = map.get(key);
      p.cases.push(c);
      (c.diseases || []).forEach((d) => p.diseases.add(d));
    });
    const arr = [...map.values()].map((p) => ({
      ...p,
      diseases: [...p.diseases],
      cases: p.cases.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)),
      lastAt: p.cases.length ? p.cases.map(x => new Date(x.submittedAt)).sort((a, b) => b - a)[0] : null,
    }));
    arr.sort((a, b) => b.lastAt - a.lastAt);
    if (search.trim()) {
      const q = search.toLowerCase();
      return arr.filter((p) => p.name.toLowerCase().includes(q) || p.hospital.toLowerCase().includes(q));
    }
    return arr;
  }, [cases, search, user]);

  if (selected) {
    const p = patients.find((x) => x.key === selected) || selected;
    return <PatientTimeline patient={p} onBack={() => setSelected(null)} onOpen={onOpen} />;
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">ประวัติผู้ป่วย</h1>
          <p className="page-subtitle">รายชื่อผู้ป่วยที่เคยถูกส่งปรึกษา รวมเคสของผู้ป่วยคนเดียวกันเข้าด้วยกัน</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <Icon name="search" size={16} className="search-icon" />
          <input className="input" placeholder="ค้นหาชื่อผู้ป่วย หรือ รพ.สต. ..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <span className="muted" style={{ fontSize: 13, marginLeft: "auto" }}>{patients.length} ผู้ป่วย</span>
      </div>

      {patients.length === 0 ? (
        <Empty title="ไม่พบผู้ป่วย" icon="user" />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {patients.map((p) => (
            <div key={p.key} className="patient-card" onClick={() => setSelected(p.key)}>
              <div className="patient-avatar">{p.name[0] || "?"}</div>
              <div>
                <div className="pn">{p.name}</div>
                <div className="pm">
                  อายุ {p.age} ปี · {p.hospital.replace("รพ.สต.", "รพ.สต. ")} · ปรึกษาล่าสุด {relativeTime(p.lastAt.toISOString())}
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                  {p.diseases.map((d) => <span key={d} className="tag">{d}</span>)}
                </div>
              </div>
              <div className="pcount">
                <strong style={{ fontSize: 18 }}>{p.cases.length}</strong>
                <div style={{ fontSize: 11, color: "var(--ink-500)" }}>เคส</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PatientTimeline = ({ patient, onBack, onOpen }) => {
  return (
    <div className="page">
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 12 }}>
        <Icon name="arrow-left" size={14} /> กลับรายชื่อผู้ป่วย
      </button>

      <div className="card card-pad-lg" style={{ marginBottom: 20, display: "flex", gap: 18, alignItems: "center" }}>
        <div className="patient-avatar" style={{ width: 64, height: 64, fontSize: 22 }}>{patient.name[0]}</div>
        <div style={{ flex: 1 }}>
          <h1 className="page-title" style={{ marginBottom: 6 }}>{patient.name}</h1>
          <div className="muted" style={{ fontSize: 14 }}>
            อายุ {patient.age} ปี · {patient.hospital}
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
            {patient.diseases.map((d) => <span key={d} className="tag">{d}</span>)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: "var(--mint-600)" }}>{patient.cases.length}</div>
          <div className="muted" style={{ fontSize: 12 }}>เคสปรึกษาทั้งหมด</div>
        </div>
      </div>

      <h2 className="section-title">Timeline การปรึกษา</h2>

      <div className="timeline" style={{ paddingLeft: 4 }}>
        {patient.cases.map((c, i) => (
          <div key={c.id} className="timeline-item">
            <div className={`timeline-dot ${c.status === "responded" ? "" : "muted"}`}>
              <Icon name={c.status === "responded" ? "check" : "clock"} size={12} />
            </div>
            <div className="card card-pad" style={{ cursor: "pointer" }} onClick={() => onOpen(c.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-400)" }}>{c.id}</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{thaiDate(c.submittedAt)}</div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                    ส่งโดย {c.submittedBy} · ประเด็น: {(c.topics || []).join(", ")}
                  </div>
                </div>
                {c.status === "responded" ? (
                  <span className="tag green">ตอบกลับแล้ว</span>
                ) : (
                  <span className="tag red">รอตอบกลับ</span>
                )}
              </div>
              {c.note && <div style={{ marginTop: 10, padding: 10, background: "var(--cream-50)", borderRadius: 8, fontSize: 13, color: "var(--ink-700)", lineHeight: 1.6 }}>{c.note}</div>}
              {c.response?.diagnosis && (
                <div style={{ marginTop: 8, padding: 10, background: "var(--mint-50)", borderRadius: 8, fontSize: 13, borderLeft: "3px solid var(--mint-500)" }}>
                  <strong style={{ color: "var(--mint-700)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>วินิจฉัย</strong>
                  <div style={{ marginTop: 2 }}>{c.response.diagnosis}</div>
                </div>
              )}
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--mint-600)", display: "flex", alignItems: "center", gap: 4 }}>
                เปิดดูรายละเอียดเคส <Icon name="chevron-right" size={12} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

window.Patients = Patients;
