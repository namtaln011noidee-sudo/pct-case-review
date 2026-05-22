// SVG chart primitives — bar, donut, h-bar, kpi delta.

const PALETTE = ["#4FA07F", "#E26D5C", "#D29127", "#4F86B0", "#6B3DB0", "#3D8466", "#A8412E"];

const BarChart = ({ data, max, height = 220, accent = "var(--mint-600)" }) => {
  // data: [{ label, value, sub? }]
  const padding = { top: 20, right: 16, bottom: 30, left: 36 };
  const w = 600;
  const h = height;
  const innerW = w - padding.left - padding.right;
  const innerH = h - padding.top - padding.bottom;
  const realMax = max ?? Math.max(1, ...data.map((d) => d.value));
  const barW = innerW / data.length * 0.7;
  const gap = innerW / data.length * 0.3;

  // grid lines (4 levels)
  const grids = Array.from({ length: 5 }, (_, i) => {
    const v = (realMax / 4) * i;
    return { y: padding.top + innerH - (v / realMax) * innerH, label: Math.round(v) };
  });

  return (
    <div className="bar-chart">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
        {grids.map((g, i) => (
          <g key={i}>
            <line x1={padding.left} x2={w - padding.right} y1={g.y} y2={g.y} className="grid-line" />
            <text x={padding.left - 6} y={g.y + 3} className="axis-text" textAnchor="end">{g.label}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = padding.left + (innerW / data.length) * i + gap / 2;
          const barH = realMax > 0 ? (d.value / realMax) * innerH : 0;
          const y = padding.top + innerH - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx="4" className="bar" fill={accent}>
                <title>{d.label}: {d.value}{d.sub ? " " + d.sub : ""}</title>
              </rect>
              {d.value > 0 && (
                <text x={x + barW / 2} y={y - 6} className="bar-label" textAnchor="middle">{d.value}</text>
              )}
              <text x={x + barW / 2} y={h - 10} className="axis-text" textAnchor="middle">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const Donut = ({ data, size = 160, thickness = 30 }) => {
  // data: [{ label, value, color? }]
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  let cum = 0;
  const segments = data.map((d, i) => {
    const pct = d.value / total;
    const dash = pct * circ;
    const offset = circ - cum * circ;
    cum += pct;
    return { ...d, color: d.color || PALETTE[i % PALETTE.length], dash, offset, pct: pct * 100 };
  });
  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--ink-100)" strokeWidth={thickness} />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx={c} cy={c} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${s.dash} ${circ}`}
            strokeDashoffset={s.offset}
            transform={`rotate(-90 ${c} ${c})`}
            strokeLinecap="butt"
          >
            <title>{s.label}: {s.value} ({s.pct.toFixed(0)}%)</title>
          </circle>
        ))}
        <text x={c} y={c - 4} textAnchor="middle" style={{ fontSize: 22, fontWeight: 700, fill: "var(--ink-900)" }}>{total}</text>
        <text x={c} y={c + 14} textAnchor="middle" style={{ fontSize: 11, fill: "var(--ink-500)" }}>รวม</text>
      </svg>
      <div className="legend">
        {segments.map((s, i) => (
          <div key={i} className="legend-item">
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span className="swatch" style={{ background: s.color }} />
              <span>{s.label}</span>
            </div>
            <div className="legend-pct">
              {s.value} <small>· {s.pct.toFixed(0)}%</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HBars = ({ data, max }) => {
  const realMax = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <div>
      {data.map((d, i) => (
        <div key={i} className="hbar-row">
          <div className="hbar-name">{d.label}</div>
          <div className="hbar-track"><div className="hbar-fill" style={{ width: `${(d.value/realMax)*100}%` }} /></div>
          <div className="hbar-val">{d.value}</div>
        </div>
      ))}
    </div>
  );
};

window.BarChart = BarChart;
window.Donut = Donut;
window.HBars = HBars;
window.CHART_PALETTE = PALETTE;
