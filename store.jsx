// store.jsx — Global state + Supabase backend

// ─── Constants ────────────────────────────────────────
const DEPARTMENTS   = ["OPD","ER","IPD ชาย","IPD หญิง","LR","NCD","อื่นๆ"];
const REVIEW_REASONS = [
  "เสียชีวิต",
  "ส่งต่อภายใน 24 ชม. หลังรับไว้ใน รพ.",
  "ภาวะแทรกซ้อนรุนแรง",
  "เกิดการร้องเรียน",
  "กลุ่มโรคเสี่ยงสูง",
  "หนีออกจาก รพ.",
  "ส่งต่อจากห้องฉุกเฉินโดยไม่ได้วางแผน",
  "อื่นๆ",
];
const FACTORS = [
  { key: "people",    label: "ด้านกำลังคน/บุคลากร" },
  { key: "process",   label: "ด้านวิธีการ/ขั้นตอนการทำงาน" },
  { key: "resource",  label: "ด้านทรัพยากร" },
  { key: "environ",   label: "ด้านสิ่งแวดล้อม" },
  { key: "policy",    label: "ด้านนโยบาย" },
  { key: "equipment", label: "ด้านอุปกรณ์/เครื่องมือ" },
];
const ROLES = [
  { key: "user",  label: "ผู้ใช้ทั่วไป",  desc: "บันทึก/แก้ไขเคสของตน" },
  { key: "head",  label: "หัวหน้าหน่วย", desc: "ดูเคสในหน่วยและอนุมัติ" },
  { key: "admin", label: "ผู้ดูแลระบบ",  desc: "เข้าถึงข้อมูลทั้งหมด" },
];
const STATUS = {
  draft:   { label: "ฉบับร่าง",         pill: "" },
  pending: { label: "รอแก้ไข",           pill: "warn" },
  doing:   { label: "กำลังดำเนินการ",    pill: "brand" },
  done:    { label: "เสร็จสิ้น",         pill: "ok" },
};

// ─── Supabase client (lazy-init) ─────────────────────
let _sb = null;
function sb() {
  if (!_sb) _sb = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
  );
  return _sb;
}

// ─── DB ↔ JS mappers ─────────────────────────────────
function caseToDb(c) {
  return {
    id:               c.id,
    hn:               c.hn               || "",
    created_by:       c.createdBy        || null,
    created_at:       c.createdAt        || new Date().toISOString().slice(0,10),
    admit_date:       c.admitDate        || "",
    admit_time:       c.admitTime        || "",
    discharge_date:   c.dischargeDate    || "",
    discharge_time:   c.dischargeTime    || "",
    review_date:      c.reviewDate       || "",
    review_time:      c.reviewTime       || "",
    department:       c.department       || "",
    department_other: c.departmentOther  || "",
    diagnosis:        c.diagnosis        || "",
    complications:    c.complications    || "",
    reasons:          c.reasons          || [],
    reason_other:     c.reasonOther      || "",
    reviewers:        c.reviewers        || "",
    strengths:        c.strengths        || "",
    weaknesses:       c.weaknesses       || "",
    factors:          c.factors          || {},
    notes:            c.notes            || "",
    status:           c.status           || "draft",
    events:           c.events           || [],
    actions:          c.actions          || [],
  };
}

function dbToCase(row) {
  return {
    id:              row.id,
    hn:              row.hn               || "",
    createdBy:       row.created_by       || "",
    createdAt:       row.created_at       || "",
    admitDate:       row.admit_date       || "",
    admitTime:       row.admit_time       || "",
    dischargeDate:   row.discharge_date   || "",
    dischargeTime:   row.discharge_time   || "",
    reviewDate:      row.review_date      || "",
    reviewTime:      row.review_time      || "",
    department:      row.department       || "",
    departmentOther: row.department_other || "",
    diagnosis:       row.diagnosis        || "",
    complications:   row.complications    || "",
    reasons:         row.reasons          || [],
    reasonOther:     row.reason_other     || "",
    reviewers:       row.reviewers        || "",
    strengths:       row.strengths        || "",
    weaknesses:      row.weaknesses       || "",
    factors:         row.factors          || { people:"", process:"", resource:"", environ:"", policy:"", equipment:"" },
    notes:           row.notes            || "",
    status:          row.status           || "draft",
    events:          row.events           || [],
    actions:         row.actions          || [],
  };
}

// ─── Remote fetch helpers ─────────────────────────────
async function fetchCases() {
  const { data } = await sb().from("cases").select("*").order("created_at", { ascending: false });
  return (data || []).map(dbToCase);
}
async function fetchProfiles() {
  const { data } = await sb().from("profiles").select("*");
  return (data || []).map(p => ({ id: p.id, name: p.name, role: p.role, dept: p.dept || "" }));
}
async function fetchProfile(uid) {
  const { data } = await sb().from("profiles").select("*").eq("id", uid).single();
  return data ? { id: data.id, name: data.name, role: data.role, dept: data.dept || "" } : null;
}

// ─── Hook ─────────────────────────────────────────────
function useStore() {
  const [state, setState] = React.useState({
    users:       [],
    currentUser: null,
    cases:       [],
    loading:     true,
  });

  // Restore session on mount
  React.useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await sb().auth.getSession();
        if (session?.user) {
          const [profile, cases, users] = await Promise.all([
            fetchProfile(session.user.id),
            fetchCases(),
            fetchProfiles(),
          ]);
          setState({ users, currentUser: profile, cases, loading: false });
        } else {
          setState(s => ({ ...s, loading: false }));
        }
      } catch(e) {
        console.error("store init:", e);
        setState(s => ({ ...s, loading: false }));
      }
    })();
  }, []);

  return {
    state:       { cases: state.cases, users: state.users, currentUserId: state.currentUser?.id },
    currentUser: state.currentUser,
    loading:     state.loading,

    async login(email, pw) {
      try {
        const { data, error } = await sb().auth.signInWithPassword({ email, password: pw });
        if (error) return { ok: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };

        // Fetch or auto-create profile (in case trigger didn't fire)
        let profile = await fetchProfile(data.user.id);
        if (!profile) {
          const meta = data.user.user_metadata || {};
          await sb().from("profiles").upsert({
            id:   data.user.id,
            name: meta.name || data.user.email?.split("@")[0] || "ผู้ใช้",
            role: meta.role || "user",
            dept: meta.dept || "",
          });
          profile = await fetchProfile(data.user.id);
        }
        if (!profile) return { ok: false, error: "ไม่พบข้อมูลผู้ใช้ กรุณาติดต่อผู้ดูแลระบบ" };

        const [cases, users] = await Promise.all([fetchCases(), fetchProfiles()]);
        setState({ users, currentUser: profile, cases, loading: false });
        return { ok: true };
      } catch(e) {
        console.error("login:", e);
        return { ok: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
      }
    },

    async register({ name, email, pw, role, dept }) {
      try {
        const { data, error } = await sb().auth.signUp({
          email,
          password: pw,
          options: { data: { name, role: role || "user", dept: dept || "" } },
        });
        if (error) return { ok: false, error: error.message };
        if (!data.user) return { ok: false, error: "ลงทะเบียนไม่สำเร็จ กรุณาลองใหม่" };

        // No session = Supabase requires email confirmation
        if (!data.session) {
          return { ok: false, error: "กรุณาตรวจสอบกล่องอีเมลและคลิกลิงก์ยืนยัน จากนั้นกลับมาเข้าสู่ระบบ" };
        }

        // Session available — upsert profile (trigger is also a fallback)
        await sb().from("profiles").upsert({
          id: data.user.id, name, role: role || "user", dept: dept || "",
        });
        const [cases, users] = await Promise.all([fetchCases(), fetchProfiles()]);
        const profile = { id: data.user.id, name, role: role || "user", dept: dept || "" };
        setState({ users, currentUser: profile, cases, loading: false });
        return { ok: true };
      } catch(e) {
        console.error("register:", e);
        return { ok: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
      }
    },

    async logout() {
      await sb().auth.signOut();
      setState({ users: [], currentUser: null, cases: [], loading: false });
    },

    async addCase(c) {
      const { data: { session } } = await sb().auth.getSession();
      if (!session) {
        return { ok: false, error: "หมดเวลาเข้าสู่ระบบ กรุณาล็อกอินใหม่อีกครั้ง" };
      }
      const id   = "c" + Math.random().toString(36).slice(2, 9);
      const full = {
        ...c, id,
        createdBy: session.user.id,
        createdAt: new Date().toISOString().slice(0, 10),
        status:    c.status || "draft",
      };
      const { error } = await sb().from("cases").insert(caseToDb(full));
      if (error) {
        console.error("addCase:", error);
        return { ok: false, error: error.message || "บันทึกไม่สำเร็จ" };
      }
      setState(s => ({ ...s, cases: [full, ...s.cases] }));
      return { ok: true, id };
    },

    async updateCase(id, patch) {
      const { error } = await sb().from("cases").update(caseToDb(patch)).eq("id", id);
      if (error) {
        console.error("updateCase:", error);
        return { ok: false, error: error.message || "บันทึกไม่สำเร็จ" };
      }
      setState(s => ({ ...s, cases: s.cases.map(c => c.id === id ? { ...c, ...patch } : c) }));
      return { ok: true };
    },

    async deleteCase(id) {
      const { error } = await sb().from("cases").delete().eq("id", id);
      if (error) {
        console.error("deleteCase:", error);
        return { ok: false, error: error.message || "ลบไม่สำเร็จ" };
      }
      setState(s => ({ ...s, cases: s.cases.filter(c => c.id !== id) }));
      return { ok: true };
    },
  };
}

// ─── Helpers ──────────────────────────────────────────
function emptyCase() {
  return {
    hn: "",
    admitDate: "", admitTime: "",
    dischargeDate: "", dischargeTime: "",
    reviewDate: new Date().toISOString().slice(0, 10),
    reviewTime: new Date().toTimeString().slice(0, 5),
    department: "", departmentOther: "",
    diagnosis: "", complications: "",
    reasons: [], reasonOther: "",
    reviewers: "",
    events: [],
    strengths: "", weaknesses: "",
    factors: { people:"", process:"", resource:"", environ:"", policy:"", equipment:"" },
    actions: [],
    notes: "",
    status: "draft",
  };
}

function thDate(d) {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    const m = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
    return `${dt.getDate()} ${m[dt.getMonth()]} ${dt.getFullYear() + 543}`;
  } catch { return d; }
}
function thDateTime(d, t) {
  if (!d) return "—";
  return thDate(d) + (t ? ` ${t} น.` : "");
}

window.useStore       = useStore;
window.DEPARTMENTS    = DEPARTMENTS;
window.REVIEW_REASONS = REVIEW_REASONS;
window.FACTORS        = FACTORS;
window.ROLES          = ROLES;
window.STATUS         = STATUS;
window.emptyCase      = emptyCase;
window.thDate         = thDate;
window.thDateTime     = thDateTime;
