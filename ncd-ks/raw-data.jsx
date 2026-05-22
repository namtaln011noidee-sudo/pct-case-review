// Menu 3: Raw data table with filters + export to xlsx / csv.

const RawData = ({ cases, user }) => {
  const { HOSPITALS } = window.NCD_DATA;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hospitalFilter, setHospitalFilter] = useState("ทั้งหมด");

  const rows = useMemo(() => {
    let arr = cases;
    if (user.role === "staff") arr = arr.filter((c) => c.hospital === user.hospital);
    if (statusFilter !== "all") arr = arr.filter((c) => c.status === statusFilter);
    if (hospitalFilter !== "ทั้งหมด") arr = arr.filter((c) => c.hospital === hospitalFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((c) => (
        c.patient.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.note || "").toLowerCase().includes(q)
      ));
    }
    return [...arr].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }, [cases, search, statusFilter, hospitalFilter, user]);

  const flatRow = (c) => {
    const allMeds = [
      ...(c.meds?.diabetes || []).map((m) => `[เบาหวาน] ${m.drug} ${m.per} เม็ด ${m.when} (${(m.times || []).join("/")})`),
      ...(c.meds?.hypertension || []).map((m) => `[ความดัน] ${m.drug} ${m.per} เม็ด ${m.when} (${(m.times || []).join("/")})`),
      ...(c.meds?.lipid || []).map((m) => `[ไขมัน] ${m.drug} ${m.per} เม็ด ${m.when} (${(m.times || []).join("/")})`),
    ].join(" | ");
    const respMeds = c.response ? [
      ...(c.response.meds?.diabetes || []).map((m) => `[เบาหวาน] ${m.drug} ${m.per} เม็ด ${m.when} (${(m.times || []).join("/")})`),
      ...(c.response.meds?.hypertension || []).map((m) => `[ความดัน] ${m.drug} ${m.per} เม็ด ${m.when} (${(m.times || []).join("/")})`),
      ...(c.response.meds?.lipid || []).map((m) => `[ไขมัน] ${m.drug} ${m.per} เม็ด ${m.when} (${(m.times || []).join("/")})`),
    ].join(" | ") : "";
    return {
      "รหัสเคส": c.id,
      "วันที่ส่ง": thaiDate(c.submittedAt),
      "ชื่อ-นามสกุล": c.patient,
      "อายุ": c.age,
      "รพ.สต.": c.hospital,
      "ผู้ส่ง": c.submittedBy,
      "โรคประจำตัว": (c.diseases || []).join(", "),
      "CKD stage": c.ckdStage || "",
      "ประเด็นปรึกษา": [...(c.topics || []), c.topicsOther].filter(Boolean).join("; "),
      "รายละเอียด": c.note || "",
      "ยาที่ใช้": allMeds,
      "จำนวนรูปภาพ": c.images?.length || 0,
      "เร่งด่วน": c.urgent ? "ใช่" : "",
      "สถานะ": c.status === "responded" ? "ตอบกลับแล้ว" : "รอตอบกลับ",
      "วินิจฉัย": c.response?.diagnosis || "",
      "ปรับยา": respMeds,
      "ผู้ตอบกลับ": c.response?.responder || "",
      "วันที่ตอบกลับ": c.response?.respondedAt ? thaiDate(c.response.respondedAt) : "",
    };
  };

  const exportCSV = () => {
    if (!rows.length) { showToast("ไม่มีข้อมูลให้ export", "error"); return; }
    const flat = rows.map(flatRow);
    const headers = Object.keys(flat[0]);
    const escape = (v) => {
      const s = String(v ?? "");
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };
    const csv = "\uFEFF" + [headers.join(","), ...flat.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `consult-ncd-ks_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`ส่งออก CSV (${flat.length} รายการ) สำเร็จ`, "success");
  };

  const exportXLSX = () => {
    if (!rows.length) { showToast("ไม่มีข้อมูลให้ export", "error"); return; }
    const flat = rows.map(flatRow);
    const headers = Object.keys(flat[0]);
    // SpreadsheetML XML format — opens cleanly in Excel / LibreOffice
    const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const rowsXml = [
      `<Row>${headers.map((h) => `<Cell ss:StyleID="head"><Data ss:Type="String">${esc(h)}</Data></Cell>`).join("")}</Row>`,
      ...flat.map((r) => `<Row>${headers.map((h) => {
        const v = r[h];
        const isNum = typeof v === "number";
        return `<Cell><Data ss:Type="${isNum ? "Number" : "String"}">${esc(v)}</Data></Cell>`;
      }).join("")}</Row>`)
    ].join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="head">
      <Font ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#3D8466" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Consult NCD KS">
    <Table>
      ${rowsXml}
    </Table>
  </Worksheet>
</Workbook>`;
    const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `consult-ncd-ks_${new Date().toISOString().slice(0,10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`ส่งออก Excel (${flat.length} รายการ) สำเร็จ`, "success");
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Raw Data</h1>
          <p className="page-subtitle">ข้อมูลเคสปรึกษาทั้งหมดในรูปแบบตาราง — กรอง ค้นหา และส่งออกได้</p>
        </div>
        <div className="row-inline">
          <button className="btn" onClick={exportCSV}><Icon name="download" size={14} /> CSV</button>
          <button className="btn btn-primary" onClick={exportXLSX}><Icon name="download" size={14} /> Excel (.xlsx)</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <Icon name="search" size={16} className="search-icon" />
          <input className="input" placeholder="ค้นหา..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {user.role !== "staff" && (
          <select className="select" style={{ width: 200 }} value={hospitalFilter} onChange={(e) => setHospitalFilter(e.target.value)}>
            <option value="ทั้งหมด">ทุก รพ.สต.</option>
            {HOSPITALS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        )}
        <div className="segment">
          <button className={statusFilter === "all" ? "active" : ""} onClick={() => setStatusFilter("all")}>ทั้งหมด</button>
          <button className={statusFilter === "pending" ? "active" : ""} onClick={() => setStatusFilter("pending")}><span className="status-dot red" /> รอตอบกลับ</button>
          <button className={statusFilter === "responded" ? "active" : ""} onClick={() => setStatusFilter("responded")}><span className="status-dot green" /> ตอบกลับแล้ว</button>
        </div>
        <span className="muted" style={{ fontSize: 13, marginLeft: "auto" }}>{rows.length} รายการ</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>สถานะ</th>
              <th>รหัสเคส</th>
              <th>วันที่ส่ง</th>
              <th>ผู้ป่วย</th>
              <th>อายุ</th>
              <th>รพ.สต.</th>
              <th>โรคประจำตัว</th>
              <th>ประเด็นปรึกษา</th>
              <th>ผู้ส่ง</th>
              <th>ผู้ตอบกลับ</th>
              <th>วันที่ตอบกลับ</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={11}>
                <Empty title="ไม่พบข้อมูล" icon="table">ลองปรับตัวกรองหรือคำค้นหา</Empty>
              </td></tr>
            ) : rows.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.status === "responded" ? <span className="tag green"><span className="status-dot green" />ตอบ</span> :
                   c.urgent ? <span className="tag amber"><span className="status-dot amber" />เร่งด่วน</span> :
                   <span className="tag red"><span className="status-dot red" />รอ</span>}
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{c.id}</td>
                <td style={{ whiteSpace: "nowrap" }}>{thaiDate(c.submittedAt, false)}</td>
                <td style={{ fontWeight: 500 }}>{c.patient}</td>
                <td>{c.age}</td>
                <td>{c.hospital.replace("รพ.สต.", "")}</td>
                <td>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {(c.diseases || []).map((d) => <span key={d} className="tag">{d}</span>)}
                  </div>
                </td>
                <td style={{ maxWidth: 240, fontSize: 12.5 }}>{(c.topics || []).join("; ")}</td>
                <td style={{ fontSize: 12.5 }}>{c.submittedBy}</td>
                <td style={{ fontSize: 12.5 }}>{c.response?.responder || "—"}</td>
                <td style={{ whiteSpace: "nowrap", fontSize: 12.5 }}>{c.response?.respondedAt ? thaiDate(c.response.respondedAt, false) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

window.RawData = RawData;
