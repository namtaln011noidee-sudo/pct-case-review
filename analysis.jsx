// analysis.jsx — Menu 2: Analysis (Section 3) + summary document

function AnalysisForm({ caseData, onChange }) {
  const c = caseData;
  const set = (patch) => onChange({ ...c, ...patch });

  function updateFactor(key, val) {
    set({ factors: { ...c.factors, [key]: val } });
  }
  function addAction(type) {
    const newA = {
      id: "a" + Math.random().toString(36).slice(2, 8),
      type, text: "", due: "", owner: "", status: "pending",
    };
    set({ actions: [...c.actions, newA] });
  }
  function updateAction(id, patch) {
    set({ actions: c.actions.map(a => a.id === id ? { ...a, ...patch } : a) });
  }
  function deleteAction(id) {
    set({ actions: c.actions.filter(a => a.id !== id) });
  }

  const actionTypes = [
    { key: "immediate", label: "การแก้ไขเฉพาะหน้า",     hint: "ระงับเหตุทันที / ลดผลกระทบ" },
    { key: "root",      label: "การแก้ที่รากเหง้าของปัญหา", hint: "ปรับ process / แก้ไขเชิงระบบ" },
    { key: "prevent",   label: "การป้องกันการเกิดซ้ำ",   hint: "นโยบาย / training / monitoring" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* ─── ส่วนที่ 3 วิเคราะห์ข้อมูล ─────────────────────── */}
      <div className="card">
        <div className="card-h">
          <div>
            <h2>ส่วนที่ 3 — วิเคราะห์ข้อมูล</h2>
            <div className="sub">ปัจจัยและข้อค้นพบ · สาเหตุการเกิดที่แท้จริง (Root Cause)</div>
          </div>
          <span className="tag">Section 3</span>
        </div>
        <div className="card-b">
          <div className="sec"><h3>ปัจจัยและข้อค้นพบ (6M Analysis)</h3><div className="ln" /></div>
          <div className="grid-2">
            {FACTORS.map(f => (
              <div className="field" key={f.key}>
                <label>{f.label}</label>
                <textarea
                  className="in" rows={4}
                  placeholder={`บันทึกปัจจัยและข้อค้นพบด้าน${f.label.replace("ด้าน", "")}...`}
                  value={c.factors[f.key] || ""}
                  onChange={e => updateFactor(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── ข้อเสนอแนะและมาตรการแก้ไข ─────────────────────── */}
      <div className="card">
        <div className="card-h">
          <div>
            <h2>ข้อเสนอแนะและมาตรการการแก้ไข</h2>
            <div className="sub">กำหนดมาตรการแก้ไข ผู้รับผิดชอบ และระยะเวลาการดำเนินการ</div>
          </div>
          <span className="tag">Action Plan</span>
        </div>
        <div className="card-b" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {actionTypes.map(at => {
            const items = c.actions.filter(a => a.type === at.key);
            return (
              <div key={at.key}>
                <div className="sec">
                  <h3>{at.label}</h3>
                  <div className="ln" />
                  <span className="muted" style={{ fontSize: 12, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{at.hint}</span>
                </div>
                {items.length === 0 ? (
                  <div style={{ color: "var(--ink-500)", fontSize: 13, padding: "6px 0 4px", fontStyle: "italic" }}>
                    ยังไม่มีรายการ
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {items.map(a => (
                      <ActionRow
                        key={a.id} a={a}
                        onUpdate={(p) => updateAction(a.id, p)}
                        onDelete={() => deleteAction(a.id)}
                      />
                    ))}
                  </div>
                )}
                <button className="btn subtle sm" style={{ marginTop: 10 }}
                  onClick={() => addAction(at.key)}>
                  <Icon.Plus size={12} /> เพิ่มมาตรการ
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── หมายเหตุเพิ่มเติม ─────────────────────────────── */}
      <div className="card">
        <div className="card-h">
          <div>
            <h2>หมายเหตุเพิ่มเติม</h2>
            <div className="sub">ข้อมูลอื่นๆ ที่เกี่ยวข้อง</div>
          </div>
        </div>
        <div className="card-b">
          <textarea className="in" rows={5}
            placeholder="บันทึกข้อมูลเพิ่มเติม เช่น การประชุม M&M, การติดตามผล, รายการเอกสารแนบ..."
            value={c.notes}
            onChange={e => set({ notes: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

function ActionRow({ a, onUpdate, onDelete }) {
  return (
    <div style={{
      border: "1px solid var(--ink-200)", borderRadius: 10, padding: 12,
      background: "var(--ink-50)",
      display: "grid", gridTemplateColumns: "1fr 180px 180px 130px 32px", gap: 10, alignItems: "start"
    }}
      className="action-row"
    >
      <textarea className="in" rows={2}
        placeholder="รายละเอียดมาตรการ..."
        value={a.text} onChange={e => onUpdate({ text: e.target.value })}
        style={{ minHeight: 60 }}
      />
      <input className="in" placeholder="ผู้รับผิดชอบ"
        value={a.owner} onChange={e => onUpdate({ owner: e.target.value })} />
      <input type="date" className="in"
        value={a.due} onChange={e => onUpdate({ due: e.target.value })} />
      <select className="in" value={a.status} onChange={e => onUpdate({ status: e.target.value })}>
        <option value="pending">รอดำเนินการ</option>
        <option value="doing">กำลังดำเนินการ</option>
        <option value="done">เสร็จสิ้น</option>
      </select>
      <button className="btn danger sm" onClick={onDelete} title="ลบ" style={{ padding: "8px 8px" }}>
        <Icon.Trash size={14} />
      </button>
      <style>{`
        @media (max-width: 800px) {
          .action-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

window.AnalysisForm = AnalysisForm;
