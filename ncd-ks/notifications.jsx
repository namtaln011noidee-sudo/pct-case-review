// Bell dropdown — surfaces recent events derived from cases.

const buildNotifications = (cases, user, readSet) => {
  const list = [];
  cases.forEach((c) => {
    // New case event — visible to doctors + admin + exec
    if (c.status === "pending" && (user.role === "doctor" || user.role === "admin" || user.role === "exec")) {
      list.push({
        id: c.id + "_new",
        caseId: c.id,
        icon: c.urgent ? "alert" : "file-text",
        urgent: c.urgent,
        title: <><strong>{c.submittedBy}</strong> {c.urgent ? "ส่งเคสเร่งด่วน" : "ส่งเคสปรึกษาใหม่"}</>,
        sub: `${c.patient} · ${c.hospital}`,
        at: c.submittedAt,
      });
    }
    // Response event — visible to the submitter's hospital + everyone else
    if (c.status === "responded" && c.response?.respondedAt) {
      const isMine = user.role === "staff" && user.hospital === c.hospital;
      const visible = isMine || user.role !== "staff";
      if (visible) {
        list.push({
          id: c.id + "_resp",
          caseId: c.id,
          icon: "check",
          title: <><strong>{c.response.responder}</strong> ตอบกลับเคสแล้ว</>,
          sub: `${c.patient} · ${c.id}`,
          at: c.response.respondedAt,
        });
      }
    }
    // Latest chat message
    if (c.messages?.length) {
      const lastMsg = c.messages[c.messages.length - 1];
      const isMine = (user.role === "staff" && user.hospital === c.hospital) ||
                     (user.role === "doctor" && lastMsg.from === "staff");
      if (isMine && user.role !== lastMsg.from) {
        // Show only if sender different from current role
        list.push({
          id: c.id + "_msg_" + lastMsg.id,
          caseId: c.id,
          icon: "send",
          title: <><strong>{lastMsg.name}</strong> ส่งข้อความ</>,
          sub: `${c.patient} — "${lastMsg.text.slice(0, 60)}${lastMsg.text.length > 60 ? "..." : ""}"`,
          at: lastMsg.at,
        });
      }
    }
  });
  return list
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 20)
    .map((n) => ({ ...n, read: readSet.has(n.id) }));
};

const NotificationBell = ({ cases, user, onOpen }) => {
  const [open, setOpen] = useState(false);
  const [readSet, setReadSet] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("ncd_ks_read") || "[]")); }
    catch { return new Set(); }
  });
  const ref = useRef();

  const notifs = useMemo(() => buildNotifications(cases, user, readSet), [cases, user, readSet]);
  const unread = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    localStorage.setItem("ncd_ks_read", JSON.stringify([...readSet]));
  }, [readSet]);

  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    setTimeout(() => window.addEventListener("click", fn), 0);
    return () => window.removeEventListener("click", fn);
  }, [open]);

  const markAllRead = () => {
    setReadSet(new Set(notifs.map((n) => n.id)));
    showToast("อ่านทั้งหมดแล้ว", "success");
  };

  const click = (n) => {
    setReadSet((prev) => { const s = new Set(prev); s.add(n.id); return s; });
    setOpen(false);
    onOpen(n.caseId);
  };

  return (
    <div className="bell-wrap" ref={ref}>
      <button className="bell-btn" onClick={() => setOpen((v) => !v)} title="กล่องแจ้งเตือน">
        <Icon name="bell" size={18} />
        {unread > 0 && <span className="bell-dot" />}
      </button>
      {open && (
        <div className="bell-panel">
          <div className="bell-panel-head">
            <h4>กล่องแจ้งเตือน {unread > 0 && <span style={{ marginLeft: 6, fontSize: 11, padding: "2px 8px", background: "var(--red-500)", color: "white", borderRadius: 999 }}>{unread} ใหม่</span>}</h4>
            {unread > 0 && <button className="btn btn-sm btn-ghost" onClick={markAllRead}>อ่านทั้งหมด</button>}
          </div>
          <div className="bell-list">
            {notifs.length === 0 ? (
              <div className="empty" style={{ padding: "32px 16px" }}>
                <div className="empty-icon"><Icon name="info" size={20} /></div>
                <div className="empty-title">ยังไม่มีแจ้งเตือน</div>
              </div>
            ) : notifs.map((n) => (
              <div key={n.id} className={`bell-item ${!n.read ? "unread" : ""}`} onClick={() => click(n)}>
                <div className="b-ico" style={n.urgent ? { background: "var(--red-50)", color: "var(--red-500)" } : {}}>
                  <Icon name={n.icon} size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="b-text">{n.title}</div>
                  <div className="b-text muted" style={{ marginTop: 2 }}>{n.sub}</div>
                  <div className="b-time">{relativeTime(n.at)}</div>
                </div>
                {!n.read && <div className="b-dot" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

window.NotificationBell = NotificationBell;
