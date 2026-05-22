// Shared data: hospitals, drug lists, sample cases, helpers

const HOSPITALS = [
  "รพ.สต.ทุ่งนาเลา",
  "รพ.สต.ทุ่งลุยลาย",
  "รพ.สต.ดงบัง",
  "รพ.สต.ทุ่งพระ",
  "รพ.สต.โนนคูณ",
  "รพ.สต.ดงกลาง",
  "รพ.สต.หนองหญ้าโก้ง",
  "รพ.สต.ผาเบียด",
  "รพ.สต.ห้วยยาง",
];

const DRUG_LISTS = {
  diabetes: [
    { name: "MFM",          strength: "500 mg" },
    { name: "MFM",          strength: "850 mg" },
    { name: "GPZ",          strength: "5 mg" },
    { name: "Pioglitazone", strength: "30 mg" },
  ],
  hypertension: [
    { name: "Amlodipine",     strength: "10 mg" },
    { name: "Enalapril",      strength: "5 mg" },
    { name: "Enalapril",      strength: "20 mg" },
    { name: "Losartan",       strength: "50 mg" },
    { name: "HCTZ",           strength: "50 mg" },
    { name: "Furosemide",     strength: "40 mg" },
    { name: "Spironolactone", strength: "25 mg" },
    { name: "Metoprolol",     strength: "100 mg" },
    { name: "Hydralazine",    strength: "25 mg" },
    { name: "Carvedilol",     strength: "12.5 mg" },
    { name: "Doxa",           strength: "2 mg" },
  ],
  lipid: [
    { name: "Simvastatin",  strength: "20 mg" },
    { name: "Gemfibrozil",  strength: "600 mg" },
  ],
};

const TIMING_OPTS = ["เช้า", "เที่ยง", "เย็น", "ก่อนนอน", "ทุก 4-6 ชม.", "ทุก 8 ชม.", "เมื่อมีอาการผิดปกติ"];
const BEFORE_AFTER = ["ก่อนอาหาร", "หลังอาหาร"];

const CONSULT_TOPICS = [
  "ระดับน้ำตาลในเลือดสูงติดต่อกัน",
  "ความดันในเลือดสูงติดต่อกัน",
  "มีปัญหาการใช้ยาความดัน",
  "มีปัญหาการใช้ยาเบาหวาน",
];

const DISEASES = ["เบาหวาน", "ความดันโลหิตสูง", "ไขมัน", "ไตเสื่อม"];
const CKD_STAGES = ["ระยะ 1", "ระยะ 2", "ระยะ 3a", "ระยะ 3b", "ระยะ 4", "ระยะ 5"];

const RESPONSE_PLANS = [
  { key: "med",      label: "ปรับยาให้รับประทาน" },
  { key: "lifestyle",label: "ปรับพฤติกรรม ควบคุมอาหาร ออกกำลังกาย" },
  { key: "bp_home",  label: "วัดความดันที่บ้าน" },
  { key: "smbg",     label: "เจาะน้ำตาลที่บ้าน (SMBG)" },
  { key: "followup", label: "นัดติดตาม" },
];

// ---- Sample cases (seed) ----
const SAMPLE_CASES = [
  {
    id: "CSL-2026-0142",
    patient: "นางสมหญิง ใจดี",
    age: 67,
    hospital: "รพ.สต.ทุ่งนาเลา",
    diseases: ["เบาหวาน", "ความดันโลหิตสูง"],
    diseasesNote: "",
    ckdStage: "",
    topics: ["ระดับน้ำตาลในเลือดสูงติดต่อกัน", "มีปัญหาการใช้ยาเบาหวาน"],
    note: "ผู้ป่วยมาตรวจติดตาม น้ำตาลก่อนอาหารเช้า 220-260 ติดต่อกัน 3 ครั้ง รับประทานยาสม่ำเสมอ ไม่ได้คุมอาหาร",
    images: [],
    meds: {
      diabetes: [{ id: 1, drug: "MFM 500 mg", per: 2, when: "หลังอาหาร", times: ["เช้า", "เย็น"] }],
      hypertension: [{ id: 2, drug: "Amlodipine 10 mg", per: 1, when: "หลังอาหาร", times: ["เช้า"] }],
      lipid: [],
    },
    submittedBy: "พว.มาลี",
    submittedFrom: "รพ.สต.ทุ่งนาเลา",
    submittedAt: "2026-05-18T08:42:00",
    status: "pending",
    urgent: true,
    response: null,
  },
  {
    id: "CSL-2026-0141",
    patient: "นายประสิทธิ์ ศรีทอง",
    age: 58,
    hospital: "รพ.สต.ดงบัง",
    diseases: ["ความดันโลหิตสูง"],
    diseasesNote: "",
    ckdStage: "",
    topics: ["ความดันในเลือดสูงติดต่อกัน"],
    note: "BP home log: เฉลี่ย 168/102 มา 1 สัปดาห์ แม้ปรับยาแล้ว",
    images: [],
    meds: {
      diabetes: [],
      hypertension: [
        { id: 1, drug: "Enalapril 20 mg", per: 1, when: "หลังอาหาร", times: ["เช้า"] },
        { id: 2, drug: "Amlodipine 10 mg", per: 1, when: "หลังอาหาร", times: ["เย็น"] },
      ],
      lipid: [],
    },
    submittedBy: "พว.สมศักดิ์",
    submittedFrom: "รพ.สต.ดงบัง",
    submittedAt: "2026-05-19T10:15:00",
    status: "pending",
    urgent: false,
    response: null,
  },
  {
    id: "CSL-2026-0140",
    patient: "นางวันดี พรหมพิทักษ์",
    age: 72,
    hospital: "รพ.สต.ทุ่งลุยลาย",
    diseases: ["เบาหวาน", "ไขมัน", "ไตเสื่อม"],
    diseasesNote: "",
    ckdStage: "ระยะ 3a",
    topics: ["มีปัญหาการใช้ยาเบาหวาน"],
    note: "GFR 48, อยากปรึกษาเรื่องการใช้ MFM ในผู้ป่วย CKD",
    images: [],
    meds: {
      diabetes: [{ id: 1, drug: "MFM 850 mg", per: 1, when: "หลังอาหาร", times: ["เช้า", "เย็น"] }],
      hypertension: [],
      lipid: [{ id: 1, drug: "Simvastatin 20 mg", per: 1, when: "หลังอาหาร", times: ["ก่อนนอน"] }],
    },
    submittedBy: "พว.อรุณ",
    submittedFrom: "รพ.สต.ทุ่งลุยลาย",
    submittedAt: "2026-05-17T14:20:00",
    status: "responded",
    urgent: false,
    response: {
      diagnosis: "DM type 2 with CKD stage 3a — eGFR ลดลงเล็กน้อย ยังคงใช้ MFM ได้แต่ลดขนาดยาลง",
      plans: {
        med: true,
        lifestyle: true,
        bp_home: false,
        smbg: true,
        smbg_duration: "1 สัปดาห์",
        bp_home_freq: "",
        followup: true,
        followup_type: "rpsto",
        followup_date: "",
        followup_time: "",
      },
      meds: {
        diabetes: [{ id: 1, drug: "MFM 500 mg", per: 1, when: "หลังอาหาร", times: ["เช้า", "เย็น"] }],
        hypertension: [],
        lipid: [{ id: 1, drug: "Simvastatin 20 mg", per: 1, when: "หลังอาหาร", times: ["ก่อนนอน"] }],
      },
      responder: "นพ.วรพล",
      respondedAt: "2026-05-17T16:00:00",
      note: "ลดขนาด MFM เหลือ 500 mg เช้า-เย็น ติดตาม Cr/eGFR ที่ รพ.สต. นัดเดิม",
    },
  },
  {
    id: "CSL-2026-0139",
    patient: "นายบุญมี ทองดี",
    age: 64,
    hospital: "รพ.สต.โนนคูณ",
    diseases: ["ความดันโลหิตสูง", "ไขมัน"],
    diseasesNote: "",
    ckdStage: "",
    topics: ["มีปัญหาการใช้ยาความดัน"],
    note: "ไอแห้งหลังเริ่ม Enalapril 1 เดือน",
    images: [],
    meds: {
      diabetes: [],
      hypertension: [{ id: 1, drug: "Enalapril 5 mg", per: 1, when: "หลังอาหาร", times: ["เช้า"] }],
      lipid: [],
    },
    submittedBy: "พว.สุดา",
    submittedFrom: "รพ.สต.โนนคูณ",
    submittedAt: "2026-05-16T09:30:00",
    status: "responded",
    urgent: false,
    response: {
      diagnosis: "ACE-I induced cough — แนะนำเปลี่ยนเป็น ARB",
      plans: {
        med: true,
        lifestyle: false,
        bp_home: true,
        smbg: false,
        smbg_duration: "",
        bp_home_freq: "weekly_wed",
        followup: true,
        followup_type: "rpsto",
      },
      meds: {
        diabetes: [],
        hypertension: [{ id: 1, drug: "Losartan 50 mg", per: 1, when: "หลังอาหาร", times: ["เช้า"] }],
        lipid: [],
      },
      responder: "นพ.วรพล",
      respondedAt: "2026-05-16T11:45:00",
      note: "หยุด Enalapril เปลี่ยนเป็น Losartan 50 mg เช้า ติดตามอาการไอ",
    },
  },
  {
    id: "CSL-2026-0138",
    patient: "นางเฉลิม ก้าวหน้า",
    age: 55,
    hospital: "รพ.สต.ห้วยยาง",
    diseases: ["เบาหวาน"],
    diseasesNote: "",
    ckdStage: "",
    topics: ["ระดับน้ำตาลในเลือดสูงติดต่อกัน"],
    note: "FBS 180-200 หลังเริ่มยา GPZ + MFM",
    images: [],
    meds: {
      diabetes: [
        { id: 1, drug: "MFM 850 mg", per: 1, when: "หลังอาหาร", times: ["เช้า", "เย็น"] },
        { id: 2, drug: "GPZ 5 mg", per: 1, when: "ก่อนอาหาร", times: ["เช้า"] },
      ],
      hypertension: [],
      lipid: [],
    },
    submittedBy: "พว.กนกพร",
    submittedFrom: "รพ.สต.ห้วยยาง",
    submittedAt: "2026-05-19T13:05:00",
    status: "pending",
    urgent: false,
    response: null,
  },
  {
    id: "CSL-2026-0137",
    patient: "นายเสน่ห์ ใจกล้า",
    age: 70,
    hospital: "รพ.สต.ทุ่งพระ",
    diseases: ["ความดันโลหิตสูง", "ไตเสื่อม"],
    diseasesNote: "",
    ckdStage: "ระยะ 3b",
    topics: ["ความดันในเลือดสูงติดต่อกัน", "มีปัญหาการใช้ยาความดัน"],
    note: "BP 170/100 ติดต่อกัน ใช้ยา 3 ตัวแล้ว",
    images: [],
    meds: {
      diabetes: [],
      hypertension: [
        { id: 1, drug: "Amlodipine 10 mg", per: 1, when: "หลังอาหาร", times: ["เช้า"] },
        { id: 2, drug: "Losartan 50 mg", per: 1, when: "หลังอาหาร", times: ["เย็น"] },
        { id: 3, drug: "HCTZ 50 mg", per: 1, when: "หลังอาหาร", times: ["เช้า"] },
      ],
      lipid: [],
    },
    submittedBy: "พว.วราภรณ์",
    submittedFrom: "รพ.สต.ทุ่งพระ",
    submittedAt: "2026-05-20T07:50:00",
    status: "pending",
    urgent: true,
    response: null,
  },
];

// ---- Seed: chat messages on a few cases ----
SAMPLE_CASES[0].messages = [
  { id: "m1", from: "staff",  name: "พว.มาลี",    text: "ส่งข้อมูลรอแพทย์ทบทวนคะ ผู้ป่วยมาในเช้านี้ น้ำตาลขึ้น 3 ครั้งติดกัน ขอบคุณค่ะ", at: "2026-05-18T08:43:00" },
];
SAMPLE_CASES[2].messages = [
  { id: "m1", from: "staff",  name: "พว.อรุณ",   text: "ผู้ป่วย eGFR 48 อยากปรึกษาขนาด MFM ค่ะ", at: "2026-05-17T14:21:00" },
  { id: "m2", from: "doctor", name: "นพ.วรพล",   text: "ลดลงเหลือ 500 mg เช้า-เย็น ติดตาม Cr/eGFR เดือนหน้าครับ", at: "2026-05-17T16:01:00" },
  { id: "m3", from: "staff",  name: "พว.อรุณ",   text: "รับทราบค่ะ จะแจ้งผู้ป่วยและส่งยาใหม่", at: "2026-05-17T16:05:00" },
];
SAMPLE_CASES[3].messages = [
  { id: "m1", from: "staff",  name: "พว.สุดา",   text: "ไอแห้งหลังเริ่ม Enalapril 1 เดือน ค่ะ", at: "2026-05-16T09:31:00" },
  { id: "m2", from: "doctor", name: "นพ.วรพล",   text: "เปลี่ยนเป็น Losartan 50 mg ครับ น่าจะช่วยได้", at: "2026-05-16T11:46:00" },
];

// Add followup dates on responded cases
SAMPLE_CASES[2].response.plans.followup_date = "2026-06-08";
SAMPLE_CASES[2].response.plans.followup_time = "09:30";
SAMPLE_CASES[2].response.plans.followup_type = "ncd";
SAMPLE_CASES[3].response.plans.followup_date = "2026-06-02";
SAMPLE_CASES[3].response.plans.followup_time = "10:00";
SAMPLE_CASES[3].response.plans.followup_type = "ncd";

// ---- Seed: extra historical cases for patient history ----
SAMPLE_CASES.push({
  id: "CSL-2026-0098",
  patient: "นางสมหญิง ใจดี",
  age: 67,
  hospital: "รพ.สต.ทุ่งนาเลา",
  diseases: ["เบาหวาน", "ความดันโลหิตสูง"],
  diseasesNote: "",
  ckdStage: "",
  topics: ["มีปัญหาการใช้ยาเบาหวาน"],
  note: "เคยปรึกษามาก่อนเรื่อง MFM ทำให้ท้องเสีย — เปลี่ยนเป็นรับประทานหลังอาหารแล้วดีขึ้น",
  images: [], messages: [],
  meds: { diabetes: [{ id: 1, drug: "MFM 500 mg", per: 2, when: "หลังอาหาร", times: ["เช้า", "เย็น"] }], hypertension: [], lipid: [] },
  submittedBy: "พว.มาลี", submittedFrom: "รพ.สต.ทุ่งนาเลา",
  submittedAt: "2026-03-12T09:00:00",
  status: "responded", urgent: false,
  response: { diagnosis: "MFM GI side effects", plans: { med: true, lifestyle: true, bp_home: false, smbg: true, smbg_duration: "1 สัปดาห์", followup: true, followup_type: "rpsto" }, meds: { diabetes: [{ id: 1, drug: "MFM 500 mg", per: 2, when: "หลังอาหาร", times: ["เช้า", "เย็น"] }], hypertension: [], lipid: [] }, responder: "นพ.วรพล", respondedAt: "2026-03-12T11:30:00", note: "ให้รับประทานหลังอาหารทันที" },
});

// ---- USERS (admin-managed) ----
const USERS = [
  { id: "u1", username: "malee.tu",   name: "พว.มาลี",        role: "staff",  hospital: "รพ.สต.ทุ่งนาเลา",  status: "active", lastLogin: "2026-05-20T08:30:00" },
  { id: "u2", username: "somsak.dn",  name: "พว.สมศักดิ์",    role: "staff",  hospital: "รพ.สต.ดงบัง",     status: "active", lastLogin: "2026-05-19T10:15:00" },
  { id: "u3", username: "arun.tl",    name: "พว.อรุณ",        role: "staff",  hospital: "รพ.สต.ทุ่งลุยลาย", status: "active", lastLogin: "2026-05-17T14:00:00" },
  { id: "u4", username: "suda.nk",    name: "พว.สุดา",        role: "staff",  hospital: "รพ.สต.โนนคูณ",    status: "active", lastLogin: "2026-05-16T09:00:00" },
  { id: "u5", username: "kanok.hy",   name: "พว.กนกพร",       role: "staff",  hospital: "รพ.สต.ห้วยยาง",   status: "active", lastLogin: "2026-05-19T13:00:00" },
  { id: "u6", username: "vara.tp",    name: "พว.วราภรณ์",    role: "staff",  hospital: "รพ.สต.ทุ่งพระ",   status: "active", lastLogin: "2026-05-20T07:50:00" },
  { id: "u7", username: "rung.dk",    name: "พว.รุ่งทิวา",    role: "staff",  hospital: "รพ.สต.ดงกลาง",    status: "inactive", lastLogin: "2026-02-12T15:00:00" },
  { id: "u8", username: "ncd.worapol",name: "นพ.วรพล สิทธิ์โชค", role: "doctor", hospital: "รพ.คอนสาร", status: "active", lastLogin: "2026-05-20T08:00:00" },
  { id: "u9", username: "ncd.suchada",name: "นพ.สุชาดา พัฒนา",  role: "doctor", hospital: "รพ.คอนสาร", status: "active", lastLogin: "2026-05-18T09:00:00" },
  { id: "u10",username: "ncd.nurse",  name: "พว.จันทร์เพ็ญ",   role: "doctor", hospital: "รพ.คอนสาร", status: "active", lastLogin: "2026-05-19T08:30:00" },
  { id: "u11",username: "admin01",    name: "ผู้ดูแลระบบ",   role: "admin",  hospital: "รพ.คอนสาร", status: "active", lastLogin: "2026-05-20T09:00:00" },
  { id: "u12",username: "director",   name: "ผอ.รพ.คอนสาร",  role: "exec",   hospital: "รพ.คอนสาร", status: "active", lastLogin: "2026-05-15T10:00:00" },
];

// ---- KNOWLEDGE BASE ----
const KNOWLEDGE_ARTICLES = [
  {
    id: "k1", category: "เบาหวาน", title: "CPG เบาหวาน: เป้าหมายการควบคุม HbA1c",
    summary: "เป้าหมาย HbA1c ในผู้ป่วยทั่วไป < 7% / ผู้สูงอายุ / ผู้มีโรคร่วม อาจปรับเป็น <8%",
    updated: "2026-04-10",
    icon: "activity",
    sections: [
      { h: "เป้าหมายการควบคุม", body: "• HbA1c <7% ในผู้ป่วยทั่วไป\n• <6.5% ในผู้ป่วยอายุน้อย ไม่มีภาวะแทรกซ้อน\n• <8% ในผู้สูงอายุ / มี CKD / โรคร่วมหลายอย่าง / ประวัติ hypoglycemia บ่อย" },
      { h: "ขั้นตอนการปรับยา", body: "1) เริ่ม MFM ทุกราย ยกเว้นข้อห้าม\n2) หาก HbA1c >9% หรือมีอาการ ใช้ combination ตั้งแต่แรก\n3) ปรับ Sulfonylurea เมื่อ FBS ยังสูง แต่ระวัง hypo\n4) Pioglitazone — ระวัง heart failure / กระดูกพรุน" },
      { h: "ส่งปรึกษาเมื่อ", body: "• HbA1c >9% หลังใช้ยา 2 ตัว\n• มีภาวะแทรกซ้อน DKA / Hypoglycemia ซ้ำๆ\n• CKD stage 3b ขึ้นไป" },
    ],
  },
  {
    id: "k2", category: "ความดัน", title: "CPG ความดันโลหิตสูง: เลือกยาเริ่มต้น",
    summary: "เริ่มยาเมื่อ BP ≥140/90 mmHg ในผู้ป่วยที่มีความเสี่ยงสูง หรือ ≥160/100 mmHg ในผู้ป่วยทั่วไป",
    updated: "2026-03-20",
    icon: "heart-pulse",
    sections: [
      { h: "ยาเริ่มต้น (first-line)", body: "• ACE-I / ARB — เหมาะกับ DM, CKD, HF\n• CCB (Amlodipine) — เหมาะกับ elderly, isolated systolic HTN\n• Thiazide diuretic — เหมาะกับ elderly, AA\n• เริ่มยา 2 ตัว combination ตั้งแต่แรกถ้า BP สูง >20/10 จากเป้าหมาย" },
      { h: "เป้าหมาย BP", body: "• <140/90 ในผู้ป่วยทั่วไป\n• <130/80 ในผู้ป่วย DM, CKD\n• <140/90 ในผู้สูงอายุ (>80 ปี: <150/90)" },
      { h: "ส่งปรึกษาเมื่อ", body: "• BP ยังคุมไม่ได้แม้ใช้ยา 3 ตัว (รวม diuretic) — Resistant HTN\n• ACE-I cough หรืออาการแพ้ยา\n• สงสัย secondary HTN" },
    ],
  },
  {
    id: "k3", category: "อาการข้างเคียงยา", title: "ACE-I induced cough (Enalapril, Lisinopril)",
    summary: "ไอแห้งเรื้อรัง พบใน 5-20% — เปลี่ยนเป็น ARB (Losartan, Valsartan) แทน",
    updated: "2026-02-15",
    icon: "alert",
    sections: [
      { h: "ลักษณะอาการ", body: "ไอแห้ง ไม่มีเสมหะ มักเริ่มภายในไม่กี่สัปดาห์-เดือนหลังเริ่มยา\nไอบ่อยขึ้นในเวลากลางคืน / นอนราบ" },
      { h: "การจัดการ", body: "1) หยุดยา ACE-I → อาการดีขึ้นใน 1-4 สัปดาห์\n2) เปลี่ยนเป็น ARB (Losartan 50 mg OD) — class นี้ไม่ทำให้ไอ\n3) ติดตามอาการและ BP หลังเปลี่ยนยา 2-4 สัปดาห์" },
    ],
  },
  {
    id: "k4", category: "อาการข้างเคียงยา", title: "Metformin: GI side effects และการใช้ใน CKD",
    summary: "GI side effects (ท้องเสีย คลื่นไส้) ลดได้ด้วยรับประทานพร้อม/หลังอาหาร. หยุดเมื่อ eGFR <30",
    updated: "2026-04-01",
    icon: "pill",
    sections: [
      { h: "GI side effects", body: "พบใน 20-30% มักเป็นช่วงแรก\n• เริ่มขนาดต่ำ 500 mg OD แล้วค่อยเพิ่ม\n• รับประทานพร้อมหรือหลังอาหาร\n• แบบ extended-release ลด GI ได้" },
      { h: "การใช้ใน CKD", body: "• eGFR >60: ใช้ขนาดเต็มได้\n• eGFR 45-59: ขนาดสูงสุด 2000 mg/วัน ติดตาม Cr ทุก 3-6 เดือน\n• eGFR 30-44: ลดเหลือ 1000 mg/วัน\n• eGFR <30: หยุดยา (เสี่ยง lactic acidosis)" },
    ],
  },
  {
    id: "k5", category: "อาการข้างเคียงยา", title: "Sulfonylurea-induced hypoglycemia (GPZ)",
    summary: "เสี่ยงสูงในผู้สูงอายุ / CKD / กินไม่ได้ — แนะนำ SMBG และระวังร่วมกับยาอื่นๆ",
    updated: "2026-01-25", icon: "alert",
    sections: [
      { h: "ปัจจัยเสี่ยง", body: "• อายุ >65 ปี\n• CKD eGFR <60\n• กินอาหารน้อย/ข้ามมื้อ\n• ใช้ร่วม warfarin, sulfa, fluconazole" },
      { h: "การจัดการ", body: "1) ลดขนาด หรือเปลี่ยนเป็นยาที่เสี่ยงต่ำกว่า (DPP-4, MFM)\n2) แนะนำ SMBG ก่อนอาหารและก่อนนอน 1-2 สัปดาห์\n3) ให้ผู้ป่วยมีน้ำตาลก้อน/น้ำหวานติดตัว" },
    ],
  },
  {
    id: "k6", category: "ไตเสื่อม", title: "การปรับยาเบาหวาน/ความดันใน CKD",
    summary: "ตารางสรุปการปรับขนาดยาใน CKD แต่ละ stage",
    updated: "2026-03-30", icon: "shield",
    sections: [
      { h: "ยาเบาหวานใน CKD", body: "• MFM: หยุดเมื่อ eGFR <30\n• GPZ: หลีกเลี่ยงเมื่อ eGFR <45 (เสี่ยง hypo)\n• Pioglitazone: ใช้ได้ทุก stage แต่ระวัง fluid retention\n• DPP-4 inhibitor: ปรับขนาดตาม eGFR" },
      { h: "ยาความดันใน CKD", body: "• ACE-I/ARB: ใช้ได้ทุก stage ติดตาม K+ และ Cr\n• Diuretic: Furosemide ทดแทน Thiazide เมื่อ eGFR <30\n• Amlodipine: ใช้ได้ปกติ" },
    ],
  },
  {
    id: "k7", category: "เบาหวาน", title: "แนวทาง SMBG (Self-Monitoring of Blood Glucose)",
    summary: "ช่วงเวลาเจาะ ความถี่ และการแปลผลในผู้ป่วยที่ไม่ใช้ insulin",
    updated: "2026-04-05", icon: "activity",
    sections: [
      { h: "ช่วงเวลาเจาะ", body: "• FBS เช้า ก่อนอาหาร — เป้าหมาย 80-130 mg/dL\n• Post-prandial 2 ชม. หลังอาหาร — <180 mg/dL\n• ก่อนนอน — 100-140 mg/dL" },
      { h: "ความถี่", body: "• ผู้ป่วยใหม่ปรับยา: เจาะ 2-4 ครั้ง/วัน เป็นเวลา 1-2 สัปดาห์\n• ควบคุมได้ดี: เจาะ 2-3 ครั้ง/สัปดาห์\n• ผู้ป่วย insulin: เจาะก่อนทุกมื้อ" },
    ],
  },
];

window.NCD_DATA = {
  HOSPITALS, DRUG_LISTS, TIMING_OPTS, BEFORE_AFTER,
  CONSULT_TOPICS, DISEASES, CKD_STAGES, RESPONSE_PLANS, SAMPLE_CASES,
  USERS, KNOWLEDGE_ARTICLES,
};
