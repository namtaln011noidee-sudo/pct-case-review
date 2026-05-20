// summary-doc.jsx — Formal A4 summary document (printable + copyable)

function SummaryDoc({ caseData, hospitalName = "โรงพยาบาลคอนสาร" }) {
  const c = caseData;

  return (
    <div className="doc" id="summary-doc">
      <h1>แบบบันทึกการทบทวนเคส (PCT Case Review)</h1>
      <div className="doc-sub">{hospitalName} · จังหวัดชัยภูมิ</div>

      <h2>ส่วนที่ 1 — รายละเอียดข้อมูล</h2>
      <table>
        <tbody>
          <tr>
            <th style={{ width: "25%" }}>เลขที่เวชระเบียน (HN)</th>
            <td style={{ width: "30%" }}>{c.hn || "—"}</td>
            <th style={{ width: "20%" }}>แผนกที่ทบทวน</th>
            <td>{c.department === "อื่นๆ" ? c.departmentOther : c.department || "—"}</td>
          </tr>
          <tr>
            <th>วัน/เวลา Admit</th>
            <td>{thDateTime(c.admitDate, c.admitTime)}</td>
            <th>วัน/เวลา Discharge / เสียชีวิต</th>
            <td>{thDateTime(c.dischargeDate, c.dischargeTime)}</td>
          </tr>
          <tr>
            <th>วันที่ทบทวนเคส</th>
            <td colSpan={3}>{thDateTime(c.reviewDate, c.reviewTime)}</td>
          </tr>
          <tr>
            <th>การวินิจฉัยโรคหลัก</th>
            <td colSpan={3}>{c.diagnosis || "—"}</td>
          </tr>
          <tr>
            <th>ภาวะแทรกซ้อนที่เกิดขึ้น</th>
            <td colSpan={3}>{c.complications || "—"}</td>
          </tr>
          <tr>
            <th>เหตุผลในการทบทวนเคส</th>
            <td colSpan={3}>
              {c.reasons.length === 0 ? "—" : (
                <React.Fragment>
                  {c.reasons.filter(r => r !== "อื่นๆ").join(" · ")}
                  {c.reasons.includes("อื่นๆ") && c.reasonOther && ` · ${c.reasonOther}`}
                </React.Fragment>
              )}
            </td>
          </tr>
          <tr>
            <th>รายชื่อผู้ทบทวนเคส</th>
            <td colSpan={3}>{c.reviewers || "—"}</td>
          </tr>
        </tbody>
      </table>

      <h2>ส่วนที่ 2 — บันทึกเหตุการณ์ที่เกิดขึ้น</h2>
      {c.events.length === 0 ? (
        <div className="doc-block muted">ไม่มีรายการ</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th style={{ width: 24 }}>#</th>
              <th style={{ width: 110 }}>วันที่</th>
              <th style={{ width: 60 }}>เวลา</th>
              <th style={{ width: 120 }}>สถานที่</th>
              <th>รายละเอียดเหตุการณ์</th>
            </tr>
          </thead>
          <tbody>
            {c.events.map((e, idx) => (
              <tr key={e.id}>
                <td>{idx + 1}</td>
                <td>{thDate(e.date)}</td>
                <td>{e.time || "—"}</td>
                <td>{e.place || "—"}</td>
                <td style={{ whiteSpace: "pre-wrap" }}>{e.text || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>จุดแข็ง / สิ่งที่ทำได้ดี</h3>
      <div className="doc-block">{c.strengths || "—"}</div>

      <h3>จุดอ่อน / สิ่งที่ควรพัฒนา</h3>
      <div className="doc-block">{c.weaknesses || "—"}</div>

      <h2>ส่วนที่ 3 — วิเคราะห์ข้อมูล</h2>

      <h3>ปัจจัยและข้อค้นพบ (6M Analysis)</h3>
      <table>
        <tbody>
          {FACTORS.map(f => (
            <tr key={f.key}>
              <th style={{ width: "28%" }}>{f.label}</th>
              <td style={{ whiteSpace: "pre-wrap" }}>{c.factors[f.key] || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>ข้อเสนอแนะและมาตรการการแก้ไข</h3>
      {["immediate", "root", "prevent"].map(type => {
        const items = c.actions.filter(a => a.type === type);
        const label = { immediate: "การแก้ไขเฉพาะหน้า", root: "การแก้ที่รากเหง้าของปัญหา", prevent: "การป้องกันการเกิดซ้ำ" }[type];
        return (
          <div key={type} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 4 }}>· {label}</div>
            {items.length === 0 ? (
              <div className="muted" style={{ paddingLeft: 12, fontStyle: "italic", fontSize: 12 }}>ไม่มีรายการ</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 24 }}>#</th>
                    <th>มาตรการ</th>
                    <th style={{ width: 130 }}>ผู้รับผิดชอบ</th>
                    <th style={{ width: 100 }}>กำหนดเสร็จ</th>
                    <th style={{ width: 90 }}>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((a, i) => (
                    <tr key={a.id}>
                      <td>{i + 1}</td>
                      <td>{a.text || "—"}</td>
                      <td>{a.owner || "—"}</td>
                      <td>{thDate(a.due)}</td>
                      <td>{({ pending: "รอ", doing: "กำลังทำ", done: "เสร็จ" })[a.status] || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}

      <h3>หมายเหตุเพิ่มเติม</h3>
      <div className="doc-block">{c.notes || "—"}</div>

      <div className="doc-foot">
        <div className="doc-sign">
          <div className="ln"></div>
          ผู้บันทึกข้อมูล
        </div>
        <div className="doc-sign">
          <div className="ln"></div>
          หัวหน้าทีม PCT
        </div>
      </div>
    </div>
  );
}

// Plain-text version for copy
function caseToText(c) {
  const lines = [];
  const sep = "═".repeat(60);
  lines.push("แบบบันทึกการทบทวนเคส (PCT Case Review)");
  lines.push("โรงพยาบาลคอนสาร · จังหวัดชัยภูมิ");
  lines.push(sep);
  lines.push("");
  lines.push("◆ ส่วนที่ 1 — รายละเอียดข้อมูล");
  lines.push("─".repeat(60));
  lines.push(`เลขที่เวชระเบียน (HN) : ${c.hn || "—"}`);
  lines.push(`แผนกที่ทบทวน        : ${c.department === "อื่นๆ" ? c.departmentOther : c.department || "—"}`);
  lines.push(`วัน/เวลา Admit       : ${thDateTime(c.admitDate, c.admitTime)}`);
  lines.push(`วัน/เวลา Discharge   : ${thDateTime(c.dischargeDate, c.dischargeTime)}`);
  lines.push(`วันที่ทบทวนเคส      : ${thDateTime(c.reviewDate, c.reviewTime)}`);
  lines.push(`การวินิจฉัยโรคหลัก : ${c.diagnosis || "—"}`);
  lines.push(`ภาวะแทรกซ้อน       : ${c.complications || "—"}`);
  lines.push(`เหตุผลทบทวน        : ${c.reasons.filter(r => r !== "อื่นๆ").join(", ") || "—"}${c.reasons.includes("อื่นๆ") && c.reasonOther ? ", " + c.reasonOther : ""}`);
  lines.push(`ผู้ทบทวน             : ${c.reviewers || "—"}`);
  lines.push("");
  lines.push("◆ ส่วนที่ 2 — บันทึกเหตุการณ์");
  lines.push("─".repeat(60));
  c.events.forEach((e, i) => {
    lines.push(`[${i + 1}] ${thDate(e.date)} ${e.time || ""}น. · ${e.place || "—"}`);
    lines.push(e.text || "—");
    lines.push("");
  });
  if (c.events.length === 0) lines.push("(ไม่มีรายการ)\n");
  lines.push("จุดแข็ง:");
  lines.push(c.strengths || "—");
  lines.push("");
  lines.push("จุดอ่อน:");
  lines.push(c.weaknesses || "—");
  lines.push("");
  lines.push("◆ ส่วนที่ 3 — วิเคราะห์ข้อมูล");
  lines.push("─".repeat(60));
  FACTORS.forEach(f => {
    lines.push(`▸ ${f.label}`);
    lines.push(`  ${c.factors[f.key] || "—"}`);
  });
  lines.push("");
  lines.push("ข้อเสนอแนะและมาตรการการแก้ไข:");
  ["immediate", "root", "prevent"].forEach(type => {
    const items = c.actions.filter(a => a.type === type);
    const label = { immediate: "การแก้ไขเฉพาะหน้า", root: "การแก้ที่รากเหง้าของปัญหา", prevent: "การป้องกันการเกิดซ้ำ" }[type];
    lines.push(`· ${label}`);
    if (items.length === 0) lines.push("  (ไม่มีรายการ)");
    items.forEach((a, i) => {
      lines.push(`  ${i + 1}. ${a.text || "—"} | ผู้รับผิดชอบ: ${a.owner || "—"} | กำหนด: ${thDate(a.due)} | สถานะ: ${({ pending: "รอดำเนินการ", doing: "กำลังดำเนินการ", done: "เสร็จสิ้น" })[a.status] || "—"}`);
    });
  });
  lines.push("");
  lines.push("หมายเหตุเพิ่มเติม:");
  lines.push(c.notes || "—");
  return lines.join("\n");
}

window.SummaryDoc = SummaryDoc;
window.caseToText = caseToText;
