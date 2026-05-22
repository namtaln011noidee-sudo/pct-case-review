// Calendar — monthly grid with NCD clinic followups and BP/SMBG home logs.

const Calendar = ({ cases, user, onOpen }) => {
  const [month, setMonth] = useState(new Date(2026, 4, 1)); // May 2026

  // Collect events from responded cases with followups
  const events = useMemo(() => {
    const scope = user.role === "staff" ? cases.filter((c) => c.hospital === user.hospital) : cases;
    const list = [];
    scope.forEach((c) => {
      const r = c.response;
      if (!r) return;
      if (r.plans?.followup && r.plans.followup_type === "ncd" && r.plans.followup_date) {
        list.push({
          id: c.id + "_fu", caseId: c.id, type: "ncd",
          date: r.plans.followup_date, time: r.plans.followup_time || "",
          title: `นัด NCD clinic — ${c.patient}`,
          patient: c.patient, hospital: c.hospital,
        });
      }
      // Synthetic BP home / SMBG events — show weekly pattern in next 4 weeks
      if (r.plans?.bp_home && r.plans.bp_home_freq === "weekly_wed") {
        const base = new Date(c.response.respondedAt);
        for (let w = 0; w < 8; w++) {
          const d = new Date(base);
          d.setDate(d.getDate() + (3 - d.getDay() + 7) % 7 + w * 7);
          if (d >= base) list.push({
            id: c.id + "_bp_" + w, caseId: c.id, type: "bp",
            date: d.toISOString().slice(0, 10),
            title: `วัด BP ที่บ้าน — ${c.patient}`,
            patient: c.patient, hospital: c.hospital,
          });
        }
      }
      if (r.plans?.smbg) {
        const base = new Date(c.response.respondedAt);
        for (let i = 0; i < 7; i++) {
          const d = new Date(base);
          d.setDate(d.getDate() + i);
          list.push({
            id: c.id + "_smbg_" + i, caseId: c.id, type: "smbg",
            date: d.toISOString().slice(0, 10),
            title: `SMBG — ${c.patient}`,
            patient: c.patient, hospital: c.hospital,
          });
        }
      }
    });
    return list;
  }, [cases, user]);

  const eventsByDate = useMemo(() => {
    const m = {};
    events.forEach((e) => {
      if (!m[e.date]) m[e.date] = [];
      m[e.date].push(e);
    });
    return m;
  }, [events]);

  const monthName = month.toLocaleDateString("th-TH", { month: "long", year: "numeric" });

  // Build month grid (start with Monday)
  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const startDow = (first.getDay() + 6) % 7; // Mon = 0
    const startDate = new Date(first);
    startDate.setDate(first.getDate() - startDow);
    const arr = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [month]);

  const today = new Date(2026, 4, 21); // for demo
  const todayStr = today.toISOString().slice(0, 10);

  const upcoming = useMemo(() => {
    return events
      .filter((e) => e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8);
  }, [events]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">ปฏิทินนัดติดตาม</h1>
          <p className="page-subtitle">นัด NCD clinic, วัด BP ที่บ้าน, SMBG — เก็บรวมจากเคสที่ได้รับการตอบกลับแล้ว</p>
        </div>
        <div className="row-inline">
          <button className="btn btn-icon btn-ghost" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
            <Icon name="chevron-left" size={16} />
          </button>
          <div style={{ minWidth: 180, textAlign: "center", fontWeight: 600, fontSize: 16 }}>{monthName}</div>
          <button className="btn btn-icon btn-ghost" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
            <Icon name="chevron-right" size={16} />
          </button>
          <button className="btn btn-sm" onClick={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>วันนี้</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
          <span className="cal-event" style={{ padding: "2px 8px" }}>NCD clinic</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
          <span className="cal-event bp" style={{ padding: "2px 8px" }}>วัด BP ที่บ้าน</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
          <span className="cal-event smbg" style={{ padding: "2px 8px" }}>SMBG</span>
        </div>
      </div>

      <div className="calendar">
        <div className="cal-head">
          <div>จ</div><div>อ</div><div>พ</div><div>พฤ</div><div>ศ</div><div>ส</div><div>อา</div>
        </div>
        <div className="cal-body">
          {cells.map((d, i) => {
            const dateStr = d.toISOString().slice(0, 10);
            const isOther = d.getMonth() !== month.getMonth();
            const isToday = dateStr === todayStr;
            const dayEvents = eventsByDate[dateStr] || [];
            return (
              <div key={i} className={`cal-cell ${isOther ? "other-month" : ""} ${isToday ? "today" : ""}`}>
                <div className="cal-num">{d.getDate()}</div>
                {dayEvents.slice(0, 3).map((ev) => (
                  <div key={ev.id}
                    className={`cal-event ${ev.type === "ncd" ? "" : ev.type}`}
                    onClick={() => onOpen(ev.caseId)}
                    title={ev.title}>
                    {ev.time && <strong>{ev.time} </strong>}{ev.title.split(" — ")[1] || ev.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="muted" style={{ fontSize: 11 }}>+ {dayEvents.length - 3} อื่นๆ</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <h2 className="section-title">นัดถัดไป</h2>
      {upcoming.length === 0 ? (
        <Empty title="ยังไม่มีนัดในช่วงเวลาที่เหลือของเดือนนี้" icon="calendar" />
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {upcoming.map((ev) => (
            <div key={ev.id} className="card card-pad" style={{ display: "flex", gap: 14, alignItems: "center", cursor: "pointer" }} onClick={() => onOpen(ev.caseId)}>
              <div style={{
                width: 56, padding: "8px 10px",
                borderRadius: 10, textAlign: "center",
                background: ev.type === "ncd" ? "var(--mint-100)" : ev.type === "bp" ? "var(--blue-50)" : "var(--amber-100)",
                color: ev.type === "ncd" ? "var(--mint-700)" : ev.type === "bp" ? "var(--blue-400)" : "var(--amber-500)",
                flexShrink: 0,
              }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{new Date(ev.date).getDate()}</div>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>{["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."][new Date(ev.date).getMonth()]}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{ev.title}</div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                  {ev.time && `${ev.time} น. · `}{ev.hospital}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--mint-600)", display: "flex", alignItems: "center", gap: 4 }}>
                เปิดเคส <Icon name="chevron-right" size={12} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

window.Calendar = Calendar;
