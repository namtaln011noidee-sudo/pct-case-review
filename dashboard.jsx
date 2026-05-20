// dashboard.jsx — Menu 4: Overview charts

function Dashboard({ cases }) {
  // ─── Aggregates ─────────────────────────────────
  const stats = React.useMemo(() => {
    const total = cases.length;
    const death = cases.filter(c => c.reasons.includes("เสียชีวิต")).length;
    const referred = cases.filter(c => c.reasons.includes("ส่งต่อภายใน 24 ชม. หลังรับไว้ใน รพ.")).length;
    const complications = cases.filter(c => c.complications && c.complications.trim()).length;

    // by month (last 6 months) — use LOCAL date keys, not toISOString (UTC)
    const now = new Date();
    const monthBuckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."][d.getMonth()];
      monthBuckets.push({ key, label, count: 0 });
    }
    cases.forEach(c => {
      const k = (c.reviewDate || "").slice(0, 7); // ISO yyyy-mm already local
      const b = monthBuckets.find(x => x.key === k);
      if (b) b.count++;
    });

    // by dept
    const byDept = DEPARTMENTS.map(d => ({
      label: d,
      count: cases.filter(c => c.department === d).length,
    }));

    // by reason
    const byReason = REVIEW_REASONS.map(r => ({
      label: r,
      count: cases.filter(c => c.reasons.includes(r)).length,
    })).sort((a, b) => b.count - a.count);

    // by factor (count how many cases have non-empty factor)
    const byFactor = FACTORS.map(f => ({
      label: f.label.replace("ด้าน", ""),
      count: cases.filter(c => c.factors && c.factors[f.key] && c.factors[f.key].trim()).length,
    }));

    // by action status (across all actions of all cases)
    let pending = 0, doing = 0, done = 0;
    cases.forEach(c => {
      (c.actions || []).forEach(a => {
        if (a.status === "pending") pending++;
        else if (a.status === "doing") doing++;
        else if (a.status === "done") done++;
      });
    });

    // top complications (split lines)
    const compMap = {};
    cases.forEach(c => {
      if (!c.complications) return;
      // Split by comma or newline
      c.complications.split(/[,\n;]+/).map(s => s.trim()).filter(Boolean).forEach(item => {
        const key = item.slice(0, 80);
        compMap[key] = (compMap[key] || 0) + 1;
      });
    });
    const topComplications = Object.entries(compMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

    return { total, death, referred, complications, monthBuckets, byDept, byReason, byFactor, actionStatus: { pending, doing, done }, topComplications };
  }, [cases]);

  return (
    <div>
      {/* KPIs */}
      <div className="kpi-grid">
        <KPI label="เคสทบทวนทั้งหมด" value={stats.total} unit="เคส" icon={<Icon.ClipboardCheck size={18} />} delta="ในระบบ" tone="brand" />
        <KPI label="เสียชีวิต" value={stats.death} unit="เคส" icon={<Icon.AlertTri size={18} />} delta={pct(stats.death, stats.total) + " ของทั้งหมด"} tone="err" />
        <KPI label="ส่งต่อภายใน 24 ชม." value={stats.referred} unit="เคส" icon={<Icon.ArrowR size={18} />} delta={pct(stats.referred, stats.total) + " ของทั้งหมด"} tone="warn" />
        <KPI label="มี Complications" value={stats.complications} unit="เคส" icon={<Icon.Activity size={18} />} delta={pct(stats.complications, stats.total) + " ของทั้งหมด"} tone="info" />
      </div>

      {/* Monthly + reasons */}
      <div className="chart-row">
        <div className="card">
          <div className="card-h">
            <div>
              <h2>จำนวนเคสรายเดือน</h2>
              <div className="sub">6 เดือนล่าสุด</div>
            </div>
            <Icon.ChartLine size={18} style={{ color: "var(--ink-400)" }} />
          </div>
          <div className="card-b">
            <MonthlyBars data={stats.monthBuckets} />
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <div>
              <h2>สถานะการแก้ไข</h2>
              <div className="sub">รวมทุกมาตรการ</div>
            </div>
            <Icon.ChartPie size={18} style={{ color: "var(--ink-400)" }} />
          </div>
          <div className="card-b">
            <Donut
              size={140}
              data={[
                { label: "รอดำเนินการ", value: stats.actionStatus.pending, color: "#b8730a" },
                { label: "กำลังดำเนินการ", value: stats.actionStatus.doing, color: "#2f679f" },
                { label: "เสร็จสิ้น", value: stats.actionStatus.done, color: "#1f8a5b" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* By dept + by reason */}
      <div className="chart-2">
        <div className="card">
          <div className="card-h">
            <div><h2>แยกตามแผนก / หน่วยงาน</h2><div className="sub">OPD · ER · IPD · LR · NCD · อื่นๆ</div></div>
            <Icon.Hospital size={18} style={{ color: "var(--ink-400)" }} />
          </div>
          <div className="card-b">
            <BarList items={stats.byDept} max={Math.max(1, ...stats.byDept.map(x => x.count))} />
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <div><h2>แยกตามเหตุผลการทบทวน</h2><div className="sub">เลือกได้มากกว่าหนึ่งต่อเคส</div></div>
            <Icon.AlertTri size={18} style={{ color: "var(--ink-400)" }} />
          </div>
          <div className="card-b">
            <BarList items={stats.byReason} max={Math.max(1, ...stats.byReason.map(x => x.count))}
              colorFn={(item) => item.label === "เสียชีวิต" ? "var(--err)" : "var(--brand-500)"} />
          </div>
        </div>
      </div>

      {/* Factors + top complications */}
      <div className="chart-2">
        <div className="card">
          <div className="card-h">
            <div><h2>ปัจจัย/สาเหตุที่พบ (6M)</h2><div className="sub">จำนวนเคสที่ระบุปัจจัยแต่ละด้าน</div></div>
            <Icon.Activity size={18} style={{ color: "var(--ink-400)" }} />
          </div>
          <div className="card-b">
            <BarList items={stats.byFactor} max={Math.max(1, ...stats.byFactor.map(x => x.count))}
              colorFn={(_, i) => ["#2f679f", "#7a5aa0", "#1f8a5b", "#b8730a", "#c0392b", "#0d7d94"][i % 6]} />
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <div><h2>Top Complications</h2><div className="sub">ภาวะแทรกซ้อนที่พบบ่อย</div></div>
            <Icon.AlertTri size={18} style={{ color: "var(--ink-400)" }} />
          </div>
          <div className="card-b">
            {stats.topComplications.length === 0 ? (
              <div className="empty" style={{ padding: "20px 0" }}>
                <p>ยังไม่มีข้อมูล complications</p>
              </div>
            ) : (
              <BarList
                items={stats.topComplications.map(([label, count]) => ({ label, count }))}
                max={Math.max(1, ...stats.topComplications.map(x => x[1]))}
                colorFn={() => "var(--err)"}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function pct(part, whole) {
  if (!whole) return "0%";
  return Math.round((part / whole) * 100) + "%";
}

function KPI({ label, value, unit, icon, delta, tone }) {
  const tones = { brand: "#2f679f", err: "#c0392b", warn: "#b8730a", info: "#1f6fb4", ok: "#1f8a5b" };
  const bg = { brand: "#eef4fb", err: "#fbe9e6", warn: "#fbf2e1", info: "#e5f0fa", ok: "#e7f6ee" };
  return (
    <div className="kpi">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div className="lbl">{label}</div>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: bg[tone] || "#eef4fb", color: tones[tone] || "#2f679f", display: "grid", placeItems: "center" }}>
          {icon}
        </div>
      </div>
      <div className="val">{value}<span className="unit"> {unit}</span></div>
      <div className="delta">{delta}</div>
    </div>
  );
}

function MonthlyBars({ data }) {
  const max = Math.max(1, ...data.map(d => d.count));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 180, padding: "12px 4px 4px" }}>
      {data.map((d, i) => {
        const h = (d.count / max) * 100;
        return (
          <div key={d.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-700)" }}>{d.count || ""}</div>
            <div style={{ width: "100%", maxWidth: 56, height: 140, background: "var(--ink-100)", borderRadius: 6, display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
              <div
                style={{
                  height: h + "%",
                  background: "linear-gradient(180deg, var(--brand-400), var(--brand-600))",
                  borderRadius: "6px 6px 0 0",
                  minHeight: d.count > 0 ? 4 : 0,
                  transition: "height .4s ease-out",
                }}
              />
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-500)" }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function BarList({ items, max, colorFn }) {
  return (
    <div className="bar-chart">
      {items.map((it, i) => {
        const w = (it.count / max) * 100;
        const color = colorFn ? colorFn(it, i) : "var(--brand-500)";
        return (
          <div className="bar-row" key={i}>
            <div className="lbl" title={it.label} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</div>
            <div className="track">
              <div className="fill" style={{ width: Math.max(it.count > 0 ? 2 : 0, w) + "%", background: color }} />
            </div>
            <div className="val">{it.count}</div>
          </div>
        );
      })}
    </div>
  );
}

function Donut({ data, size = 140 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="donut-row">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ink-100)" strokeWidth={14} />
        {total > 0 && data.map((d, i) => {
          const len = (d.value / total) * c;
          const dash = `${len} ${c - len}`;
          const el = (
            <circle
              key={i}
              cx={size / 2} cy={size / 2} r={r}
              fill="none" stroke={d.color} strokeWidth={14}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--ink-900)">{total}</text>
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fontSize="10" fill="var(--ink-500)">รายการ</text>
      </svg>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={i} className="li">
            <div className="sw" style={{ background: d.color }} />
            <span>{d.label}</span>
            <span className="n">{d.value} {total ? `(${pct(d.value, total)})` : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
