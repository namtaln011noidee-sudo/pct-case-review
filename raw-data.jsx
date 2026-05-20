// raw-data.jsx — Menu 5: Raw data table + xlsx export

function RawData({ cases, users, onToast }) {
  const [search, setSearch] = React.useState("");

  const rows = React.useMemo(() => {
    return cases.map(c => {
      const owner = users.find(u => u.id === c.createdBy);
      const dept = c.department === "อื่นๆ" ? c.departmentOther : c.department;
      const reasons = [
        ...c.reasons.filter(r => r !== "อื่นๆ"),
        ...(c.reasons.includes("อื่นๆ") && c.reasonOther ? [c.reasonOther] : [])
      ].join(", ");
      const losDays = (c.admitDate && c.dischargeDate)
        ? Math.max(0, Math.round((new Date(c.dischargeDate) - new Date(c.admitDate)) / 86400000))
        : "";
      return {
        id: c.id,
        hn: c.hn,
        admit: c.admitDate + (c.admitTime ? " " + c.admitTime : ""),
        discharge: c.dischargeDate + (c.dischargeTime ? " " + c.dischargeTime : ""),
        review: c.reviewDate + (c.reviewTime ? " " + c.reviewTime : ""),
        department: dept || "",
        diagnosis: c.diagnosis,
        complications: c.complications,
        reasons,
        reviewers: c.reviewers,
        eventCount: c.events.length,
        events: c.events.map((e, i) => `[${i + 1}] ${e.date} ${e.time} ${e.place}: ${e.text}`).join(" || "),
        strengths: c.strengths,
        weaknesses: c.weaknesses,
        f_people: c.factors.people,
        f_process: c.factors.process,
        f_resource: c.factors.resource,
        f_environ: c.factors.environ,
        f_policy: c.factors.policy,
        f_equipment: c.factors.equipment,
        actions_immediate: c.actions.filter(a => a.type === "immediate").map(a => `${a.text} (ผู้รับผิดชอบ: ${a.owner}, กำหนด: ${a.due}, สถานะ: ${statusLabel(a.status)})`).join(" || "),
        actions_root: c.actions.filter(a => a.type === "root").map(a => `${a.text} (ผู้รับผิดชอบ: ${a.owner}, กำหนด: ${a.due}, สถานะ: ${statusLabel(a.status)})`).join(" || "),
        actions_prevent: c.actions.filter(a => a.type === "prevent").map(a => `${a.text} (ผู้รับผิดชอบ: ${a.owner}, กำหนด: ${a.due}, สถานะ: ${statusLabel(a.status)})`).join(" || "),
        notes: c.notes,
        losDays,
        status: STATUS[c.status]?.label || c.status,
        createdBy: owner?.name || "",
        createdAt: c.createdAt,
      };
    });
  }, [cases, users]);

  const filtered = rows.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return JSON.stringify(r).toLowerCase().includes(q);
  });

  function exportXLSX() {
    if (!window.XLSX) {
      onToast("ไลบรารี XLSX ยังไม่พร้อม กรุณาลองใหม่อีกครั้ง");
      return;
    }
    const wb = window.XLSX.utils.book_new();

    // Sheet 1 — Raw data
    const dataSheetRows = filtered.map((r, i) => ({
      "ลำดับ": i + 1,
      "HN": r.hn,
      "Admit": r.admit,
      "Discharge / เสียชีวิต": r.discharge,
      "วันที่ทบทวน": r.review,
      "แผนก": r.department,
      "Primary Diagnosis": r.diagnosis,
      "Complications": r.complications,
      "เหตุผลทบทวน": r.reasons,
      "ผู้ทบทวน": r.reviewers,
      "จำนวนเหตุการณ์": r.eventCount,
      "บันทึกเหตุการณ์": r.events,
      "จุดแข็ง": r.strengths,
      "จุดอ่อน": r.weaknesses,
      "ปัจจัย: คน": r.f_people,
      "ปัจจัย: วิธี": r.f_process,
      "ปัจจัย: ทรัพยากร": r.f_resource,
      "ปัจจัย: สิ่งแวดล้อม": r.f_environ,
      "ปัจจัย: นโยบาย": r.f_policy,
      "ปัจจัย: อุปกรณ์": r.f_equipment,
      "มาตรการเฉพาะหน้า": r.actions_immediate,
      "มาตรการแก้ที่ราก": r.actions_root,
      "มาตรการป้องกัน": r.actions_prevent,
      "หมายเหตุ": r.notes,
      "Length of Stay (วัน)": r.losDays,
      "สถานะเคส": r.status,
      "ผู้บันทึก": r.createdBy,
      "วันที่บันทึก": r.createdAt,
    }));

    const ws = window.XLSX.utils.json_to_sheet(dataSheetRows);
    // Set column widths
    const cols = Object.keys(dataSheetRows[0] || {}).map(k => ({
      wch: Math.min(50, Math.max(12, k.length + 4))
    }));
    ws['!cols'] = cols;
    window.XLSX.utils.book_append_sheet(wb, ws, "Cases");

    // Sheet 2 — Actions flat
    const actionRows = [];
    cases.forEach(c => {
      c.actions.forEach(a => {
        actionRows.push({
          "HN": c.hn,
          "แผนก": c.department,
          "ประเภทมาตรการ": ({ immediate: "เฉพาะหน้า", root: "รากเหง้า", prevent: "ป้องกัน" })[a.type] || a.type,
          "รายละเอียด": a.text,
          "ผู้รับผิดชอบ": a.owner,
          "กำหนดเสร็จ": a.due,
          "สถานะ": statusLabel(a.status),
        });
      });
    });
    if (actionRows.length > 0) {
      const ws2 = window.XLSX.utils.json_to_sheet(actionRows);
      ws2['!cols'] = [{ wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 60 }, { wch: 20 }, { wch: 14 }, { wch: 14 }];
      window.XLSX.utils.book_append_sheet(wb, ws2, "Actions");
    }

    const today = new Date().toISOString().slice(0, 10);
    window.XLSX.writeFile(wb, `PCT_CaseReview_Konsan_${today}.xlsx`);
    onToast("ส่งออกไฟล์ Excel เรียบร้อย");
  }

  function exportCSV() {
    const headers = ["HN", "Admit", "Discharge", "วันที่ทบทวน", "แผนก", "Diagnosis", "Complications", "เหตุผล", "ผู้ทบทวน", "LOS", "สถานะ"];
    const lines = [headers.join(",")];
    filtered.forEach(r => {
      const row = [r.hn, r.admit, r.discharge, r.review, r.department, r.diagnosis, r.complications, r.reasons, r.reviewers, r.losDays, r.status];
      lines.push(row.map(v => `"${String(v || "").replace(/"/g, '""')}"`).join(","));
    });
    const csv = "\ufeff" + lines.join("\n"); // BOM for Excel Thai
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PCT_CaseReview_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onToast("ส่งออกไฟล์ CSV เรียบร้อย");
  }

  return (
    <div>
      <div className="toolbar">
        <div className="search">
          <Icon.Search size={15} />
          <input placeholder="ค้นหาในข้อมูลทั้งหมด..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn ghost" onClick={exportCSV}>
          <Icon.Download size={14} /> CSV
        </button>
        <button className="btn" onClick={exportXLSX}>
          <Icon.Download size={14} /> ส่งออก Excel (.xlsx)
        </button>
      </div>

      <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
        แสดง <b style={{ color: "var(--ink-900)" }}>{filtered.length}</b> รายการ
        {filtered.length !== rows.length && <span> จากทั้งหมด {rows.length} รายการ</span>}
        · ไฟล์ Excel จะมี 2 sheet: <b>Cases</b> (ข้อมูลเคส) และ <b>Actions</b> (รายการมาตรการแก้ไข)
      </div>

      <div className="tbl-wrap" style={{ maxHeight: "calc(100vh - 280px)" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>HN</th>
              <th>แผนก</th>
              <th>Admit</th>
              <th>Discharge</th>
              <th>LOS</th>
              <th>Diagnosis</th>
              <th>Complications</th>
              <th>เหตุผล</th>
              <th>เหตุการณ์</th>
              <th>มาตรการ</th>
              <th>สถานะ</th>
              <th>ผู้บันทึก</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={12} style={{ textAlign: "center", padding: 40, color: "var(--ink-500)" }}>ไม่มีข้อมูล</td></tr>
            ) : filtered.map(r => {
              const actionCount = cases.find(c => c.id === r.id)?.actions.length || 0;
              return (
                <tr key={r.id}>
                  <td className="mono nowrap"><b>{r.hn}</b></td>
                  <td className="nowrap">{r.department}</td>
                  <td className="nowrap">{thDate(r.admit.slice(0, 10))}</td>
                  <td className="nowrap">{r.discharge ? thDate(r.discharge.slice(0, 10)) : "—"}</td>
                  <td className="mono right">{r.losDays || "—"}</td>
                  <td style={{ maxWidth: 240 }}>{trunc(r.diagnosis, 80)}</td>
                  <td style={{ maxWidth: 200 }}>{trunc(r.complications, 60)}</td>
                  <td style={{ maxWidth: 200 }}>{trunc(r.reasons, 60)}</td>
                  <td className="mono right">{r.eventCount}</td>
                  <td className="mono right">{actionCount}</td>
                  <td className="nowrap">
                    <span className={"pill " + (STATUS[cases.find(c => c.id === r.id)?.status]?.pill || "")}>{r.status}</span>
                  </td>
                  <td className="nowrap muted">{r.createdBy}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function statusLabel(s) {
  return ({ pending: "รอดำเนินการ", doing: "กำลังดำเนินการ", done: "เสร็จสิ้น" })[s] || s;
}

function trunc(s, n) {
  if (!s) return "—";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

window.RawData = RawData;
