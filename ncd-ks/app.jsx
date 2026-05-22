// App shell: top nav, route switching, persist state in localStorage.

const LS_USER = "ncd_ks_user";
const LS_CASES = "ncd_ks_cases_v2";
const LS_USERS = "ncd_ks_users_v2";

const App = () => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_USER) || "null"); } catch { return null; }
  });
  const [cases, setCases] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(LS_CASES) || "null");
      if (stored && Array.isArray(stored) && stored.length) return stored;
    } catch {}
    return window.NCD_DATA.SAMPLE_CASES;
  });
  const [users, setUsers] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(LS_USERS) || "null");
      if (stored && Array.isArray(stored) && stored.length) return stored;
    } catch {}
    return window.NCD_DATA.USERS;
  });
  const [route, setRoute] = useState({ view: "dashboard" });
  const [navOpen, setNavOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
    else localStorage.removeItem(LS_USER);
  }, [user]);
  useEffect(() => {
    try {
      const trimmed = cases.map((c) => ({
        ...c,
        images: (c.images || []).map((im) => ({ id: im.id, name: im.name, dataUrl: im.dataUrl?.slice(0, 100000) })),
      }));
      localStorage.setItem(LS_CASES, JSON.stringify(trimmed));
    } catch {}
  }, [cases]);
  useEffect(() => { localStorage.setItem(LS_USERS, JSON.stringify(users)); }, [users]);

  if (!user) return <>
    <Login onLogin={setUser} />
    <ToastHost />
  </>;

  const counts = useMemo(() => {
    const scoped = user.role === "staff" ? cases.filter((c) => c.hospital === user.hospital) : cases;
    return { pending: scoped.filter((c) => c.status === "pending").length };
  }, [cases, user]);

  const goDashboard = () => setRoute({ view: "dashboard" });
  const openCase = (id) => setRoute({ view: "detail", id });
  const editCase = (id) => setRoute({ view: "edit", id });
  const newCase = () => setRoute({ view: "new" });

  const saveCase = (c) => {
    setCases((prev) => {
      const idx = prev.findIndex((x) => x.id === c.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = c; return next; }
      return [c, ...prev];
    });
    setRoute({ view: "detail", id: c.id });
  };
  const updateCase = (c) => setCases((prev) => prev.map((x) => x.id === c.id ? c : x));

  const ROLE_LABELS = { staff: "เจ้าหน้าที่ รพ.สต.", doctor: "แพทย์ NCD", admin: "Admin", exec: "ผู้บริหาร" };

  const cur = route.view === "detail" || route.view === "edit" ? cases.find((c) => c.id === route.id) : null;
  const selectedPatient = route.view === "patient" && route.patientKey ?
    (() => {
      const cs = cases.filter((c) => `${c.patient}__${c.age}__${c.hospital}` === route.patientKey);
      if (!cs.length) return null;
      const diseases = new Set();
      cs.forEach((c) => (c.diseases || []).forEach((d) => diseases.add(d)));
      return { key: route.patientKey, name: cs[0].patient, age: cs[0].age, hospital: cs[0].hospital, cases: cs, diseases: [...diseases] };
    })() : null;

  // Main nav items
  const mainItems = [
    { id: "dashboard", icon: "file-text", label: "หน้าหลัก", badge: counts.pending },
    ...(user.role === "staff" || user.role === "doctor" ? [{ id: "new", icon: "plus", label: "ส่งเคสใหม่" }] : []),
    { id: "patients", icon: "user", label: "ผู้ป่วย" },
    { id: "calendar", icon: "calendar", label: "ปฏิทินนัด" },
  ];
  const overflowItems = [
    { id: "reports", icon: "activity", label: "รายงานสถิติ", visible: true },
    { id: "knowledge", icon: "shield", label: "คลังความรู้", visible: true },
    { id: "raw", icon: "table", label: "Raw Data", visible: true },
    { id: "users", icon: "users", label: "จัดการผู้ใช้", visible: user.role === "admin" },
  ].filter((x) => x.visible);

  const isActive = (id) => {
    if (id === "dashboard") return ["dashboard", "detail", "new", "edit"].includes(route.view);
    return route.view === id;
  };

  const handleNav = (id) => {
    setNavOpen(false); setMoreOpen(false);
    if (id === "new") return newCase();
    if (id === "dashboard") return goDashboard();
    setRoute({ view: id });
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#" onClick={(e) => { e.preventDefault(); goDashboard(); }}>
            <div className="brand-mark"><Icon name="heart-pulse" size={20} /></div>
            <div className="brand-text">
              Consult NCD KS
              <small>คปสอ.คอนสาร</small>
            </div>
          </a>

          <button className="mobile-menu-btn" onClick={() => setNavOpen((v) => !v)}>
            <Icon name="menu" size={20} />
          </button>

          <nav className={`nav ${navOpen ? "open" : ""}`}>
            {mainItems.map((item) => (
              <button key={item.id} className={`nav-item ${isActive(item.id) ? "active" : ""}`} onClick={() => handleNav(item.id)}>
                <Icon name={item.icon} size={14} /> {item.label}
                {item.badge > 0 && <span className="pill">{item.badge}</span>}
              </button>
            ))}
            <NavOverflow items={overflowItems} active={overflowItems.find((x) => isActive(x.id))?.id} onSelect={handleNav} open={moreOpen} setOpen={setMoreOpen} />
          </nav>

          <NotificationBell cases={cases} user={user} onOpen={openCase} />

          <UserDropdown user={user} role={ROLE_LABELS[user.role]} onProfile={() => setRoute({ view: "profile" })} onLogout={() => { setUser(null); setRoute({ view: "dashboard" }); }} />
        </div>
      </header>

      {route.view === "dashboard" && (
        <Dashboard cases={cases} user={user} onOpen={openCase} onNew={newCase} />
      )}
      {route.view === "new" && (
        <CaseForm user={user} onSave={saveCase} onCancel={goDashboard} />
      )}
      {route.view === "edit" && cur && (
        <CaseForm user={user} existing={cur} onSave={saveCase} onCancel={() => openCase(cur.id)} />
      )}
      {route.view === "detail" && cur && (
        <CaseDetail caseData={cur} user={user} onUpdate={updateCase} onBack={goDashboard} onEdit={() => editCase(cur.id)} />
      )}
      {route.view === "patients" && (
        <Patients cases={cases} user={user} onOpen={openCase} />
      )}
      {route.view === "calendar" && (
        <Calendar cases={cases} user={user} onOpen={openCase} />
      )}
      {route.view === "reports" && (
        <Reports cases={cases} />
      )}
      {route.view === "knowledge" && (
        <Knowledge />
      )}
      {route.view === "raw" && (
        <RawData cases={cases} user={user} />
      )}
      {route.view === "users" && (
        <UserManagement users={users} onChange={setUsers} user={user} />
      )}
      {route.view === "profile" && (
        <Profile
          user={user}
          cases={cases}
          onUpdate={setUser}
          onSwitchRole={(role) => {
            const map = {
              staff: { name: `จนท. ${(user.role === "staff" ? user.hospital : "รพ.สต.ทุ่งนาเลา").replace("รพ.สต.","")}`, hospital: user.role === "staff" ? user.hospital : "รพ.สต.ทุ่งนาเลา" },
              doctor: { name: "นพ.วรพล สิทธิ์โชค", hospital: "รพ.คอนสาร" },
              admin: { name: "ผู้ดูแลระบบ", hospital: "รพ.คอนสาร" },
              exec: { name: "ผอ.รพ.คอนสาร", hospital: "รพ.คอนสาร" },
            };
            setUser({ ...user, role, ...map[role] });
            showToast(`สลับเป็น ${ROLE_LABELS[role]}`, "success");
          }}
          onLogout={() => { setUser(null); setRoute({ view: "dashboard" }); }}
        />
      )}

      <ToastHost />
    </div>
  );
};

// ---------- Nav overflow "More" dropdown ----------
const NavOverflow = ({ items, active, onSelect, open, setOpen }) => {
  const ref = useRef();
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    setTimeout(() => window.addEventListener("click", fn), 0);
    return () => window.removeEventListener("click", fn);
  }, [open]);

  return (
    <div className="nav-overflow" ref={ref}>
      <button className={`nav-item ${active ? "active" : ""}`} onClick={() => setOpen((v) => !v)}>
        <Icon name="more" size={14} /> เพิ่มเติม <Icon name="chevron-down" size={11} />
      </button>
      {open && (
        <div className="nav-overflow-panel">
          {items.map((it) => (
            <button key={it.id} className={active === it.id ? "active" : ""} onClick={() => onSelect(it.id)}>
              <Icon name={it.icon} size={14} /> {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------- User dropdown ----------
const UserDropdown = ({ user, role, onProfile, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    setTimeout(() => window.addEventListener("click", fn), 0);
    return () => window.removeEventListener("click", fn);
  }, [open]);

  return (
    <div className="bell-wrap" ref={ref}>
      <button className="user-chip" onClick={() => setOpen((v) => !v)} style={{ cursor: "pointer" }}>
        <div className="avatar">{user.name.slice(0, 2)}</div>
        <div style={{ textAlign: "left" }}>
          <div className="name">{user.name}</div>
          <div className="role">{role} · {user.hospital.length > 20 ? user.hospital.slice(0, 20) + "..." : user.hospital}</div>
        </div>
        <Icon name="chevron-down" size={14} style={{ color: "var(--ink-400)", marginLeft: 2 }} />
      </button>
      {open && (
        <div className="bell-panel" style={{ width: 220, top: 50 }}>
          <div style={{ padding: 12, borderBottom: "1px solid var(--ink-100)" }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{user.hospital}</div>
          </div>
          <div className="nav-overflow-panel" style={{ boxShadow: "none", border: 0, padding: 6 }}>
            <button onClick={() => { setOpen(false); onProfile(); }}>
              <Icon name="user" size={14} /> โปรไฟล์และการตั้งค่า
            </button>
            <hr className="divider-horiz" />
            <button onClick={() => { setOpen(false); onLogout(); }} style={{ color: "var(--red-500)" }}>
              <Icon name="log-out" size={14} /> ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
