// Shared UI: Toast host, Modal, Lightbox, Image uploader, Med picker.
// Plus tiny helpers for formatting Thai dates and copying text.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ---------- Helpers ----------
const uid = () => Math.random().toString(36).slice(2, 10);

const thaiDate = (iso, withTime = true) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  const day = d.getDate();
  const m = months[d.getMonth()];
  const y = d.getFullYear() + 543;
  const time = withTime ? ` ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")} น.` : "";
  return `${day} ${m} ${y}${time}`;
};

const relativeTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "เมื่อสักครู่";
  if (diff < 3600) return `${Math.floor(diff/60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff/3600)} ชม.ที่แล้ว`;
  if (diff < 86400*7) return `${Math.floor(diff/86400)} วันก่อน`;
  return thaiDate(iso, false);
};

// ---------- Toast ----------
const toastListeners = new Set();
const showToast = (msg, variant = "default") => {
  const id = uid();
  toastListeners.forEach((fn) => fn({ id, msg, variant, expires: Date.now() + 2800 }));
};
const ToastHost = () => {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const fn = (t) => setToasts((prev) => [...prev, t]);
    toastListeners.add(fn);
    return () => toastListeners.delete(fn);
  }, []);
  useEffect(() => {
    if (!toasts.length) return;
    const i = setInterval(() => {
      setToasts((prev) => prev.filter((t) => t.expires > Date.now()));
    }, 300);
    return () => clearInterval(i);
  }, [toasts.length]);
  return (
    <div className="toast-host">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.variant}`}>
          {t.variant === "success" && <Icon name="check" size={16} />}
          {t.variant === "error" && <Icon name="alert" size={16} />}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
};

// ---------- Lightbox ----------
const Lightbox = ({ images, startIdx = 0, onClose }) => {
  const [idx, setIdx] = useState(startIdx);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [images.length, onClose]);
  if (!images?.length) return null;
  const cur = images[idx];
  return (
    <div className="lightbox" onClick={(e) => { if (e.target.classList.contains("lightbox")) onClose(); }}>
      <div className="lightbox-top">
        <div style={{ fontSize: 14 }}>{idx + 1} / {images.length} — {cur.name || ""}</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-icon" style={{ background: "rgba(255,255,255,0.15)", color: "white" }} onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
            <Icon name="zoom-out" size={18} />
          </button>
          <button className="btn btn-icon" style={{ background: "rgba(255,255,255,0.15)", color: "white" }} onClick={() => setZoom((z) => Math.min(4, z + 0.25))}>
            <Icon name="zoom-in" size={18} />
          </button>
          <button className="btn btn-icon" style={{ background: "rgba(255,255,255,0.15)", color: "white" }} onClick={onClose}>
            <Icon name="x" size={18} />
          </button>
        </div>
      </div>
      <div className="lightbox-img">
        <img src={cur.dataUrl} alt={cur.name || ""} style={{ transform: `scale(${zoom})` }} />
      </div>
      <div className="lightbox-thumbs">
        {images.map((im, i) => (
          <img key={im.id || i} src={im.dataUrl} className={i === idx ? "active" : ""} onClick={() => { setIdx(i); setZoom(1); }} alt="" />
        ))}
      </div>
    </div>
  );
};

// ---------- Image Uploader ----------
const ImageUploader = ({ images, onChange, readOnly = false }) => {
  const fileRef = useRef();
  const camRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [lightIdx, setLightIdx] = useState(null);

  const handleFiles = (files) => {
    if (!files?.length) return;
    const arr = Array.from(files).slice(0, 12);
    Promise.all(arr.map((f) => new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve({ id: uid(), name: f.name, dataUrl: r.result });
      r.readAsDataURL(f);
    }))).then((newImgs) => {
      onChange([...(images || []), ...newImgs]);
      showToast(`เพิ่มรูปภาพ ${newImgs.length} รูป`, "success");
    });
  };

  return (
    <>
      {!readOnly && (
        <div
          className={`uploader ${dragging ? "dragging" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault(); setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <div className="uploader-icon"><Icon name="image" size={24} /></div>
          <div style={{ fontWeight: 500, color: "var(--ink-700)" }}>ลากรูปมาวางที่นี่ หรือเลือกจากเครื่อง</div>
          <div className="field-hint">รองรับ .jpg .png สูงสุด 12 รูป</div>
          <div className="uploader-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => fileRef.current.click()}>
              <Icon name="upload" size={14} /> เลือกไฟล์
            </button>
            <button type="button" className="btn btn-sm" onClick={() => camRef.current.click()}>
              <Icon name="camera" size={14} /> ถ่ายภาพ
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
          <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleFiles(e.target.files)} />
        </div>
      )}
      {!!images?.length && (
        <div className="thumbs">
          {images.map((im, i) => (
            <div key={im.id || i} className="thumb" onClick={() => setLightIdx(i)}>
              <img src={im.dataUrl} alt={im.name || ""} />
              {!readOnly && (
                <button type="button" className="thumb-del" onClick={(e) => { e.stopPropagation(); onChange(images.filter((_, j) => j !== i)); }}>
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {lightIdx !== null && (
        <Lightbox images={images} startIdx={lightIdx} onClose={() => setLightIdx(null)} />
      )}
    </>
  );
};

// ---------- Checkbox / Radio chip ----------
const ChipCheck = ({ checked, onClick, children, disabled }) => (
  <label className={`checkbox ${checked ? "checked" : ""}`} onClick={disabled ? null : onClick}>
    <span className="box">{checked && <Icon name="check" size={12} />}</span>
    <span>{children}</span>
  </label>
);
const ChipRadio = ({ checked, onClick, children }) => (
  <label className={`radio ${checked ? "checked" : ""}`} onClick={onClick}>
    <span className="box" />
    <span>{children}</span>
  </label>
);

// ---------- Med Picker ----------
// Builds rows for a category. value = array of { id, drug, per, when, times }
const MedPicker = ({ category, value, onChange, label }) => {
  const { DRUG_LISTS, TIMING_OPTS, BEFORE_AFTER } = window.NCD_DATA;
  const drugs = DRUG_LISTS[category];
  const rows = value || [];

  const update = (id, patch) => onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id) => onChange(rows.filter((r) => r.id !== id));
  const addPreset = (d) => onChange([...rows, { id: uid(), drug: `${d.name} ${d.strength}`, per: 1, when: "หลังอาหาร", times: ["เช้า"] }]);
  const addCustom = () => onChange([...rows, { id: uid(), drug: "", per: 1, when: "หลังอาหาร", times: ["เช้า"], custom: true }]);

  return (
    <div className="card card-pad">
      <div className="card-head">
        <h3 className="card-title">
          <Icon name="pill" size={16} /> {label}
        </h3>
        <span className="muted" style={{ fontSize: 12 }}>{rows.length} รายการ</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {drugs.map((d, i) => {
          const already = rows.some((r) => !r.custom && r.drug === `${d.name} ${d.strength}`);
          return (
            <button key={i} type="button" className={`checkbox ${already ? "checked" : ""}`} onClick={() => already ? remove(rows.find((r) => r.drug === `${d.name} ${d.strength}`).id) : addPreset(d)}>
              <span className="box">{already && <Icon name="check" size={12} />}</span>
              <span>{d.name} <span style={{ color: "var(--ink-400)", fontSize: 11 }}>{d.strength}</span></span>
            </button>
          );
        })}
        <button type="button" className="checkbox" onClick={addCustom} style={{ color: "var(--mint-700)", borderStyle: "dashed" }}>
          <Icon name="plus" size={14} /> อื่นๆ ระบุเอง
        </button>
      </div>

      {rows.length > 0 && (
        <div style={{ display: "grid", gap: 8 }}>
          {rows.map((r) => (
            <div key={r.id} className="med-row">
              {r.custom ? (
                <input
                  className="input input-sm"
                  placeholder="ระบุชื่อยา + ขนาด"
                  value={r.drug}
                  onChange={(e) => update(r.id, { drug: e.target.value })}
                  style={{ height: "100%" }}
                />
              ) : (
                <div className="drug-name">
                  {r.drug.split(" ").slice(0, -2).join(" ") || r.drug}
                  <span className="pill-strength">{r.drug.split(" ").slice(-2).join(" ")}</span>
                </div>
              )}
              <div className="drug-controls">
                <span className="label">ครั้งละ</span>
                <input
                  type="number" min="0" step="0.5"
                  className="input input-sm input-num"
                  value={r.per}
                  onChange={(e) => update(r.id, { per: parseFloat(e.target.value) || 0 })}
                />
                <span className="label">เม็ด</span>

                <div style={{ display: "flex", gap: 4, marginLeft: 4 }}>
                  {BEFORE_AFTER.map((opt) => (
                    <ChipRadio key={opt} checked={r.when === opt} onClick={() => update(r.id, { when: opt })}>{opt}</ChipRadio>
                  ))}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, width: "100%", marginTop: 4 }}>
                  {TIMING_OPTS.map((t) => (
                    <ChipCheck
                      key={t}
                      checked={(r.times || []).includes(t)}
                      onClick={() => {
                        const cur = r.times || [];
                        update(r.id, { times: cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t] });
                      }}
                    >{t}</ChipCheck>
                  ))}
                </div>
              </div>
              <button type="button" className="med-remove" onClick={() => remove(r.id)}><Icon name="trash" size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Compact read-only med list
const MedList = ({ meds }) => {
  const all = [
    ...(meds.diabetes || []).map((m) => ({ ...m, cat: "เบาหวาน" })),
    ...(meds.hypertension || []).map((m) => ({ ...m, cat: "ความดัน" })),
    ...(meds.lipid || []).map((m) => ({ ...m, cat: "ไขมัน" })),
  ];
  if (!all.length) return <div className="muted" style={{ fontSize: 13 }}>— ไม่มี —</div>;
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {all.map((m) => (
        <div key={m.cat + m.id} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5, padding: "8px 10px", background: "var(--cream-50)", borderRadius: 8 }}>
          <span className="tag" style={{ minWidth: 50, textAlign: "center" }}>{m.cat}</span>
          <strong>{m.drug || "(ไม่ระบุชื่อยา)"}</strong>
          <span className="muted">รับประทานครั้งละ {m.per} เม็ด {m.when}</span>
          <span className="muted">— {(m.times || []).join(", ")}</span>
        </div>
      ))}
    </div>
  );
};

// ---------- Modal ----------
const Modal = ({ open, onClose, title, children, footer, wide }) => {
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open]);
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(30,42,38,0.4)",
      zIndex: 90, display: "grid", placeItems: "center", padding: 16,
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "white", borderRadius: 18, width: "100%",
        maxWidth: wide ? 720 : 480,
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        animation: "toast-in .2s ease-out",
        maxHeight: "90vh", display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--ink-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 17 }}>{title}</h3>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding: 22, overflowY: "auto" }}>{children}</div>
        {footer && (
          <div style={{ padding: "14px 22px", borderTop: "1px solid var(--ink-100)", display: "flex", gap: 8, justifyContent: "flex-end" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Empty state ----------
const Empty = ({ icon = "file-text", title, children, action }) => (
  <div className="empty">
    <div className="empty-icon"><Icon name={icon} size={26} /></div>
    <div className="empty-title">{title}</div>
    {children && <div style={{ fontSize: 13.5, marginBottom: 14 }}>{children}</div>}
    {action}
  </div>
);

Object.assign(window, {
  uid, thaiDate, relativeTime, showToast,
  ToastHost, Lightbox, ImageUploader,
  ChipCheck, ChipRadio, MedPicker, MedList, Modal, Empty,
});
