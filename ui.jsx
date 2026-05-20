// ui.jsx — Shared UI components (Modal, Toast, ChipsField, helpers)

function Modal({ title, children, onClose, footer, wide }) {
  React.useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose && onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      <div className="modal" style={wide ? { maxWidth: 1100 } : null}>
        <div className="modal-h">
          <h3>{title}</h3>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="modal-b">{children}</div>
        {footer && <div className="modal-f">{footer}</div>}
      </div>
    </div>
  );
}

function Toast({ msg, onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className="toast">{msg}</div>;
}

function ChipsField({ options, value, onChange, multi = true, otherSlot }) {
  function toggle(v) {
    if (multi) {
      if (value.includes(v)) onChange(value.filter(x => x !== v));
      else onChange([...value, v]);
    } else {
      onChange(v);
    }
  }
  const set = multi ? value : [value];
  return (
    <div className="chips">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          className={"chip" + (set.includes(opt) ? " on" : "")}
          onClick={() => toggle(opt)}
        >
          {set.includes(opt) && <Icon.Check size={13} />}
          {opt}
        </button>
      ))}
    </div>
  );
}

// Confirm dialog
function Confirm({ title, msg, onConfirm, onCancel, danger }) {
  return (
    <Modal title={title} onClose={onCancel}
      footer={
        <React.Fragment>
          <button className="btn ghost" onClick={onCancel}>ยกเลิก</button>
          <button className={"btn" + (danger ? " danger" : "")} onClick={onConfirm}>ตกลง</button>
        </React.Fragment>
      }
    >
      <p style={{ margin: 0, color: "var(--ink-700)" }}>{msg}</p>
    </Modal>
  );
}

window.Modal = Modal;
window.Toast = Toast;
window.ChipsField = ChipsField;
window.Confirm = Confirm;
