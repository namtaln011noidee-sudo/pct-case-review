// app.jsx — Main app shell: routing, sidebar, page wiring

const NAV = [
  { key: "menu1", num: "1", label: "บันทึกเคส",       sub: "ส่วนที่ 1-2", icon: "ClipboardCheck" },
  { key: "menu2", num: "2", label: "วิเคราะห์",       sub: "ส่วนที่ 3",   icon: "Activity" },
  { key: "menu3", num: "3", label: "รายการเคส",       sub: "ดู/แก้ไข",   icon: "FileText" },
  { key: "menu4", num: "4", label: "Dashboard",      sub: "ภาพรวม",     icon: "BarChart" },
  { key: "menu5", num: "5", label: "Raw data",       sub: "ส่งออกไฟล์", icon: "Database" },
];

function App() {
  const store = useStore();
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [page, setPage] = React.useState("menu3"); // start on case list after login
  const [editing, setEditing] = React.useState(null); // current case being edited (full obj)
  const [editingId, setEditingId] = React.useState(null);
  const [summaryFor, setSummaryFor] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  // Apply theme palette to root
  React.useEffect(() => {
    const theme = THEMES[tweaks.theme] || THEMES.navy;
    const root = document.documentElement;
    Object.entries(theme.tokens).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [tweaks.theme]);

  function showToast(msg) { setToast(msg); }

  // Begin new case (menu 1)
  function startNew() {
    setEditing(emptyCase());
    setEditingId(null);
    setPage("menu1");
  }
  // Open existing case (from list)
  function openCase(id, atPage = "menu1") {
    const c = store.state.cases.find(x => x.id === id);
    if (!c) return;
    setEditing({ ...c });
    setEditingId(id);
    setPage(atPage);
  }
  // Save current edit
  async function saveEdit(nextStatus) {
    if (!editing) return null;
    if (!editing.hn) {
      showToast("กรุณากรอก HN ก่อนบันทึก");
      return null;
    }
    const data = nextStatus ? { ...editing, status: nextStatus } : editing;
    let id = editingId;
    if (id) {
      const result = await store.updateCase(id, data);
      if (result && !result.ok) {
        showToast("⚠️ บันทึกไม่สำเร็จ: " + result.error);
        return null;
      }
      showToast("บันทึกข้อมูลแล้ว");
    } else {
      const result = await store.addCase(data);
      if (!result || !result.ok) {
        showToast("⚠️ บันทึกไม่สำเร็จ: " + (result?.error || "กรุณาลองใหม่"));
        return null;
      }
      id = result.id;
      setEditingId(id);
      showToast("เพิ่มเคสใหม่เรียบร้อย");
    }
    setEditing({ ...data });
    return id;
  }

  // Loading (checking session)
  if (store.loading) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", gap:16, color:"var(--ink-400)" }}>
        <Icon.Logo size={40} />
        <span style={{ fontFamily:"var(--font-th)", fontSize:15 }}>กำลังเชื่อมต่อ…</span>
      </div>
    );
  }

  // Logged out?
  if (!store.currentUser) {
    return (
      <React.Fragment>
        <LoginScreen store={store} onToast={showToast} />
        {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
        <AppTweaks tweaks={tweaks} setTweak={setTweak} />
      </React.Fragment>
    );
  }

  const u = store.currentUser;

  const pageTitles = {
    menu1: { crumb: "เมนูที่ 1", title: editingId ? `แก้ไขเคส · HN ${editing?.hn || ""}` : "เพิ่มเคสใหม่ — ส่วนที่ 1-2" },
    menu2: { crumb: "เมนูที่ 2", title: editingId ? `วิเคราะห์เคส · HN ${editing?.hn || ""}` : "วิเคราะห์ข้อมูล — ส่วนที่ 3" },
    menu3: { crumb: "เมนูที่ 3", title: "รายการเคส" },
    menu4: { crumb: "เมนูที่ 4", title: "Dashboard — ภาพรวม" },
    menu5: { crumb: "เมนูที่ 5", title: "Raw data" },
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="logo"><Icon.Logo size={28} /></div>
          <div>
            <div className="name">PCT Case Review</div>
            <div className="sub">รพ.คอนสาร</div>
          </div>
        </div>

        {NAV.map(n => {
          const IC = Icon[n.icon];
          const active = page === n.key;
          return (
            <button key={n.key} className={"nav-item" + (active ? " active" : "")}
              onClick={() => {
                if (n.key === "menu1" || n.key === "menu2") {
                  // If no case open, treat menu1 as "new"
                  if (!editing) {
                    if (n.key === "menu1") startNew();
                    else { setPage("menu3"); showToast("กรุณาเลือกเคสจากรายการก่อนวิเคราะห์"); }
                    return;
                  }
                  setPage(n.key);
                } else {
                  setPage(n.key);
                }
              }}>
              <span className="icon"><IC size={16} /></span>
              <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                <span>{n.label}</span>
                <span style={{ fontSize: 11, opacity: .6, marginTop: 2 }}>{n.sub}</span>
              </span>
              <span className="num">{n.num}</span>
            </button>
          );
        })}

        <div className="who">
          <div className="av">{u.name.split(/\s+/).map(w => w[0]).slice(0, 2).join("")}</div>
          <div className="info">
            <b>{u.name}</b>
            <span>{ROLES.find(r => r.key === u.role)?.label}{u.dept ? " · " + u.dept : ""}</span>
          </div>
          <button className="out" onClick={async () => { await store.logout(); showToast("ออกจากระบบแล้ว"); }} title="ออกจากระบบ">
            <Icon.Logout size={15} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <div className="topbar">
          <div>
            <div className="crumb">{pageTitles[page].crumb}</div>
            <h1>{pageTitles[page].title}</h1>
          </div>
          <div className="actions">
            {(page === "menu1" || page === "menu2") && editing && (
              <React.Fragment>
                <button className="btn ghost" onClick={() => setSummaryFor(editing)}>
                  <Icon.FileText size={14} /> ดูเอกสารสรุป
                </button>
                <button className="btn" onClick={() => saveEdit()}>
                  <Icon.Save size={14} /> บันทึก
                </button>
                {page === "menu1" && (
                  <button className="btn subtle" onClick={async () => {
                    const id = await saveEdit();
                    if (id || editingId) setPage("menu2");
                  }}>
                    วิเคราะห์ต่อ <Icon.ArrowR size={14} />
                  </button>
                )}
              </React.Fragment>
            )}
            {page === "menu3" && (
              <button className="btn" onClick={startNew}><Icon.Plus size={14} /> เพิ่มเคสใหม่</button>
            )}
          </div>
        </div>

        <div className="page">
          {page === "menu1" && editing && (
            <CaseForm caseData={editing} onChange={setEditing} currentUser={u} />
          )}
          {page === "menu2" && editing && (
            <AnalysisForm caseData={editing} onChange={setEditing} />
          )}
          {page === "menu3" && (
            <CaseList
              cases={store.state.cases}
              users={store.state.users}
              onOpen={(id) => openCase(id, "menu1")}
              onNew={startNew}
              onDelete={async (id) => {
                const result = await store.deleteCase(id);
                if (result && !result.ok) { showToast("⚠️ ลบไม่สำเร็จ: " + result.error); return; }
                showToast("ลบเคสแล้ว");
                if (editingId === id) { setEditing(null); setEditingId(null); }
              }}
              currentUser={u}
            />
          )}
          {page === "menu4" && <Dashboard cases={store.state.cases} />}
          {page === "menu5" && <RawData cases={store.state.cases} users={store.state.users} onToast={showToast} />}
        </div>
      </main>

      {/* Summary doc modal */}
      {summaryFor && (
        <SummaryModal
          caseData={summaryFor}
          onClose={() => setSummaryFor(null)}
          onToast={showToast}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {/* Tweaks panel */}
      <AppTweaks tweaks={tweaks} setTweak={setTweak} />
    </div>
  );
}

// ─── Summary Modal ─────────────────────────────────────
function SummaryModal({ caseData, onClose, onToast }) {
  async function copyText() {
    try {
      await navigator.clipboard.writeText(caseToText(caseData));
      onToast("คัดลอกข้อความเรียบร้อย");
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = caseToText(caseData);
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      onToast("คัดลอกข้อความเรียบร้อย");
    }
  }

  function doPrint() {
    window.print();
  }

  return (
    <Modal
      title={`เอกสารสรุปการทบทวนเคส · HN ${caseData.hn || "—"}`}
      onClose={onClose}
      wide
      footer={
        <React.Fragment>
          <button className="btn ghost" onClick={copyText}><Icon.Copy size={14} /> คัดลอกข้อความ</button>
          <button className="btn ghost" onClick={doPrint}><Icon.Print size={14} /> พิมพ์ / Save PDF</button>
          <button className="btn" onClick={onClose}>กลับไปแก้ไข</button>
        </React.Fragment>
      }
    >
      <div className="doc-shell">
        <SummaryDoc caseData={caseData} />
      </div>
    </Modal>
  );
}

// ─── Themes ───────────────────────────────────────────
const THEMES = {
  navy: {
    label: "Navy / Slate (มาตรฐาน)",
    tokens: {
      "--brand-50": "#eef4fb", "--brand-100": "#d8e6f4", "--brand-200": "#b5cce8",
      "--brand-300": "#84acd7", "--brand-400": "#4f86c0", "--brand-500": "#2f679f",
      "--brand-600": "#1f4f82", "--brand-700": "#1a3f67", "--brand-800": "#14304f", "--brand-900": "#0d2238",
    },
  },
  teal: {
    label: "Teal (เขียวสุขภาพ)",
    tokens: {
      "--brand-50": "#e7f5f3", "--brand-100": "#cae9e4", "--brand-200": "#9bd2cb",
      "--brand-300": "#5fb3a8", "--brand-400": "#2f9889", "--brand-500": "#147f70",
      "--brand-600": "#0f6358", "--brand-700": "#0d4d44", "--brand-800": "#093a33", "--brand-900": "#062924",
    },
  },
  burgundy: {
    label: "Burgundy (แดงเข้ม)",
    tokens: {
      "--brand-50": "#fbeef0", "--brand-100": "#f3d5da", "--brand-200": "#e3a8b3",
      "--brand-300": "#cd7888", "--brand-400": "#a94e63", "--brand-500": "#892f47",
      "--brand-600": "#6d2339", "--brand-700": "#561b2c", "--brand-800": "#3f1320", "--brand-900": "#2b0c16",
    },
  },
  forest: {
    label: "Forest (เขียวเข้ม)",
    tokens: {
      "--brand-50": "#eaf3e9", "--brand-100": "#d0e5cd", "--brand-200": "#a5cba0",
      "--brand-300": "#76ab6f", "--brand-400": "#4d8a47", "--brand-500": "#326e2d",
      "--brand-600": "#255722", "--brand-700": "#1d441b", "--brand-800": "#163214", "--brand-900": "#0e240e",
    },
  },
  graphite: {
    label: "Graphite (เทา-ดำ minimalist)",
    tokens: {
      "--brand-50": "#eef0f3", "--brand-100": "#d6dae0", "--brand-200": "#a8b1bd",
      "--brand-300": "#7a8595", "--brand-400": "#525c6e", "--brand-500": "#374050",
      "--brand-600": "#262d3b", "--brand-700": "#1c222d", "--brand-800": "#141921", "--brand-900": "#0d1118",
    },
  },
};

function AppTweaks({ tweaks, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Color theme" />
      <TweakSelect
        label="ชุดสีหลัก"
        value={tweaks.theme}
        options={Object.keys(THEMES).map(k => ({ value: k, label: THEMES[k].label }))}
        onChange={v => setTweak("theme", v)}
      />
      <div style={{ display: "flex", gap: 6, padding: "6px 0", flexWrap: "wrap" }}>
        {Object.entries(THEMES).map(([k, t]) => (
          <button
            key={k}
            onClick={() => setTweak("theme", k)}
            title={t.label}
            style={{
              width: 30, height: 30, borderRadius: 8,
              border: tweaks.theme === k ? "2px solid #29261b" : "1px solid rgba(0,0,0,.12)",
              background: `linear-gradient(135deg, ${t.tokens["--brand-400"]}, ${t.tokens["--brand-700"]})`,
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>
      <TweakSection label="ข้อมูล" />
      <TweakButton
        label="รีเฟรชข้อมูลจาก Supabase"
        secondary
        onClick={() => location.reload()}
      />
    </TweaksPanel>
  );
}

window.App = App;
