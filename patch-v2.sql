-- PCT Case Review — Patch v2: Fix auth & profile issues
-- วิธีใช้: Supabase Dashboard > SQL Editor > New query > วาง SQL นี้ > Run

-- ════════════════════════════════════════════════════════
-- 1. ยืนยันอีเมลให้ผู้ใช้ที่ยังไม่ได้ยืนยัน
--    (แก้ปัญหาที่ Supabase ส่งเมลยืนยันแต่ผู้ใช้ยังไม่ได้คลิก)
-- ════════════════════════════════════════════════════════
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- ════════════════════════════════════════════════════════
-- 2. สร้าง profiles ที่ขาดหายไปสำหรับ users ที่มีอยู่แล้ว
--    (แก้ปัญหา trigger ไม่ทำงาน หรือ profile ไม่ถูกสร้าง)
-- ════════════════════════════════════════════════════════
INSERT INTO public.profiles (id, name, role, dept)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'role', 'user'),
  COALESCE(u.raw_user_meta_data->>'dept', '')
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════
-- 3. ตรวจสอบผลลัพธ์
-- ════════════════════════════════════════════════════════
SELECT
  u.email,
  u.email_confirmed_at IS NOT NULL AS confirmed,
  p.name,
  p.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at DESC;
