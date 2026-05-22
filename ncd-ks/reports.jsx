// Executive / Reports dashboard with KPIs and SVG charts.

const Reports = ({ cases }) => {
  const { HOSPITALS, DISEASES } = window.NCD_DATA;

  // ----- KPI math -----
  const totalCases = cases.length;
  const respondedCases = cases.filter((c) => c.status === "responded");
  const pendingCases = cases.filter((c) => c.status === "pending");

  // Response time analysis (hours between submittedAt and respondedAt)
  const responseTimes = respondedCases
    .filter((c) => c.response?.respondedAt)
    .map((c) => (new Date(c.response.respondedAt) - new Date(c.submittedAt)) / 3600000);
  const within24h = responseTimes.filter((h) => h <= 24).length;
  const within48h = responseTimes.filter((h) => h <= 48).length;
  const avgResponseHours = responseTimes.length
    ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;

  const pct24 = respondedCases.length ? Math.round((within24h / respondedCases.length) * 100) : 0;
  const pct48 = respondedCases.length ? Math.round((within48h / respondedCases.length) * 100) : 0;

  // ----- Cases per week (last 8 weeks) -----
  const weekly = useMemo(() => {
    const now = new Date("2026-05-21");
    const buckets = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - (start.getDay() === 0 ? 6 : start.getDay() - 1) - 7 * i);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setDate(start.getDate() + 7);
      const count = cases.filter((c) => {
        const t = new Date(c.submittedAt);
        return t >= start && t < end;
      }).length;
      buckets.push({
        label: `${start.getDate()}/${start.getMonth() + 1}`,
        value: count,
      });
    }
    return buckets;
  }, [cases]);

  // ----- Monthly chart (last 6 months) -----
  const monthly = useMemo(() => {
    const now = new Date("2026-05-21");
    const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
    const buckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const count = cases.filter((c) => {
        const t = new Date(c.submittedAt);
        return t >= d && t < next;
      }).length;
      buckets.push({ label: months[d.getMonth()], value: count });
    }
    return buckets;
  }, [cases]);

  // ----- Top รพ.สต. -----
  const topHospitals = useMemo(() => {
    const counts = {};
    cases.forEach((c) => { counts[c.hospital] = (counts[c.hospital] || 0) + 1; });
    return Object.entries(counts)
      .map(([h, v]) => ({ label: h.replace("รพ.สต.", ""), value: v }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [cases]);

  // ----- Topic breakdown -----
  const topicCounts = useMemo(() => {
    const counts = {
      "เบาหวาน (น้ำตาลสูง)": 0,
      "ความดัน (BP สูง)": 0,
      "ปัญหายาความดัน": 0,
      "ปัญหายาเบาหวาน": 0,
    };
    cases.forEach((c) => {
      (c.topics || []).forEach((t) => {
        if (t.includes("น้ำตาล")) counts["เบาหวาน (น้ำตาลสูง)"]++;
        else if (t.includes("ความดันใน")) counts["ความดัน (BP สูง)"]++;
        else if (t.includes("ยาความดัน")) counts["ปัญหายาความดัน"]++;
        else if (t.includes("ยาเบาหวาน")) counts["ปัญหายาเบาหวาน"]++;
      });
    });
    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  }, [cases]);

  // ----- Disease breakdown -----
  const diseaseCounts = useMemo(() => {
    const counts = {};
    DISEASES.forEach((d) => counts[d] = 0);
    cases.forEach((c) => (c.diseases || []).forEach((d) => { counts[d] = (counts[d] || 0) + 1; }));
    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  }, [cases]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">รายงานและสถิติ</h1>
          <p className="page-subtitle">แดชบอร์ดผู้บริหาร — ภาพรวมการดำเนินงานเครือข่ายปรึกษา NCD คปสอ.คอนสาร</p>
        </div>
        <div className="row-inline">
          <span className="muted" style={{ fontSize: 13 }}>ข้อมูล ณ {thaiDate("2026-05-21T09:00:00", false)}</span>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-label">เคสปรึกษาทั้งหมด</div>
          <div className="kpi-value">{totalCases}</div>
          <span className="kpi-delta up"><Icon name="chevron-right" size={11} style={{ transform: "rotate(-45deg)" }} /> +{weekly.at(-1)?.value || 0} สัปดาห์นี้</span>
        </div>
        <div className="kpi">
          <div className="kpi-label">ตอบกลับภายใน 24 ชม.</div>
          <div className="kpi-value" style={{ color: pct24 >= 80 ? "var(--green-600)" : pct24 >= 60 ? "var(--amber-500)" : "var(--red-500)" }}>{pct24}%</div>
          <span className={`kpi-delta ${pct24 >= 80 ? "up" : "down"}`}>เป้า ≥80%</span>
        </div>
        <div className="kpi">
          <div className="kpi-label">ตอบกลับภายใน 48 ชม.</div>
          <div className="kpi-value" style={{ color: pct48 >= 95 ? "var(--green-600)" : "var(--amber-500)" }}>{pct48}%</div>
          <span className="kpi-delta flat">เฉลี่ย {avgResponseHours.toFixed(1)} ชม.</span>
        </div>
        <div className="kpi">
          <div className="kpi-label">เคสค้างรอตอบ</div>
          <div className="kpi-value" style={{ color: pendingCases.length > 0 ? "var(--red-500)" : "var(--green-600)" }}>{pendingCases.length}</div>
          <span className="kpi-delta flat">{pendingCases.filter(c => c.urgent).length} เคสเร่งด่วน</span>
        </div>
      </div>

      <h2 className="section-title">แนวโน้มเคสปรึกษา</h2>
      <div className="chart-row">
        <div className="card card-pad">
          <div className="card-head">
            <h3 className="card-title"><Icon name="activity" size={14} /> รายสัปดาห์ (8 สัปดาห์ล่าสุด)</h3>
          </div>
          <BarChart data={weekly} accent="var(--mint-600)" />
        </div>
        <div className="card card-pad">
          <div className="card-head">
            <h3 className="card-title"><Icon name="calendar" size={14} /> รายเดือน (6 เดือนล่าสุด)</h3>
          </div>
          <BarChart data={monthly} accent="#4F86B0" />
        </div>
      </div>

      <h2 className="section-title">สัดส่วนข้อมูลและหน่วยบริการ</h2>
      <div className="chart-grid">
        <div className="card card-pad">
          <div className="card-head">
            <h3 className="card-title"><Icon name="hospital" size={14} /> Top รพ.สต. ที่ส่งเคสมากที่สุด</h3>
            <span className="muted" style={{ fontSize: 12 }}>{HOSPITALS.length} หน่วยในเครือข่าย</span>
          </div>
          <HBars data={topHospitals} />
        </div>
        <div className="card card-pad">
          <div className="card-head">
            <h3 className="card-title"><Icon name="file-text" size={14} /> สัดส่วนประเด็นปรึกษา</h3>
          </div>
          <Donut data={topicCounts} />
        </div>
      </div>

      <div className="chart-row" style={{ marginTop: 16 }}>
        <div className="card card-pad">
          <div className="card-head">
            <h3 className="card-title"><Icon name="pill" size={14} /> สัดส่วนโรคประจำตัว</h3>
          </div>
          <Donut data={diseaseCounts} />
        </div>
        <div className="card card-pad">
          <div className="card-head">
            <h3 className="card-title"><Icon name="clock" size={14} /> ตัวชี้วัด SLA การตอบกลับ</h3>
          </div>
          <div style={{ padding: "10px 0" }}>
            <SlaRow label="ตอบใน 24 ชม." pct={pct24} target={80} value={`${within24h}/${respondedCases.length}`} />
            <SlaRow label="ตอบใน 48 ชม." pct={pct48} target={95} value={`${within48h}/${respondedCases.length}`} />
            <SlaRow label="ค่าเฉลี่ย" pct={Math.min(100, 100 - (avgResponseHours/24)*100)} target={null} value={`${avgResponseHours.toFixed(1)} ชม.`} />
          </div>
          <div style={{ background: "var(--cream-100)", padding: 12, borderRadius: 8, fontSize: 12.5, marginTop: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <Icon name="info" size={14} style={{ color: "var(--mint-600)", marginTop: 2 }} />
            <span style={{ color: "var(--ink-700)", lineHeight: 1.5 }}>
              เป้าหมายระดับ คปสอ.: ≥80% ของเคสปรึกษาต้องได้รับการตอบกลับภายใน 24 ชม.
              และ ≥95% ภายใน 48 ชม.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SlaRow = ({ label, pct, target, value }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
      <span style={{ fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value} {target !== null && <span style={{ color: "var(--ink-400)", fontSize: 11, fontWeight: 400 }}>· เป้า {target}%</span>}</span>
    </div>
    <div className="hbar-track" style={{ height: 8 }}>
      <div className="hbar-fill" style={{
        width: `${Math.max(2, Math.min(100, pct))}%`,
        background: target === null ? "linear-gradient(90deg, var(--blue-400), #6B3DB0)" :
                    pct >= target ? "linear-gradient(90deg, var(--mint-400), var(--green-500))" :
                    "linear-gradient(90deg, #E8C75A, var(--amber-500))",
      }} />
    </div>
  </div>
);

window.Reports = Reports;
