-- PCT Case Review — Supabase Migration
-- วิธีใช้: ไปที่ Supabase Dashboard > SQL Editor > New query > วาง SQL นี้ > Run

-- ════════════════════════════════════════════════════
-- 1. PROFILES  (ต่อจาก auth.users ที่ Supabase สร้างให้อัตโนมัติ)
-- ════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
  id   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user'
         CHECK (role IN ('user','head','admin')),
  dept TEXT DEFAULT ''
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ════════════════════════════════════════════════════
-- 2. CASES
-- ════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.cases (
  id               TEXT PRIMARY KEY,
  hn               TEXT NOT NULL DEFAULT '',
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TEXT DEFAULT TO_CHAR(CURRENT_DATE,'YYYY-MM-DD'),
  admit_date       TEXT DEFAULT '',
  admit_time       TEXT DEFAULT '',
  discharge_date   TEXT DEFAULT '',
  discharge_time   TEXT DEFAULT '',
  review_date      TEXT DEFAULT '',
  review_time      TEXT DEFAULT '',
  department       TEXT DEFAULT '',
  department_other TEXT DEFAULT '',
  diagnosis        TEXT DEFAULT '',
  complications    TEXT DEFAULT '',
  reasons          JSONB DEFAULT '[]',
  reason_other     TEXT DEFAULT '',
  reviewers        TEXT DEFAULT '',
  strengths        TEXT DEFAULT '',
  weaknesses       TEXT DEFAULT '',
  factors          JSONB DEFAULT '{"people":"","process":"","resource":"","environ":"","policy":"","equipment":""}',
  notes            TEXT DEFAULT '',
  status           TEXT DEFAULT 'draft'
                     CHECK (status IN ('draft','pending','doing','done')),
  events           JSONB DEFAULT '[]',
  actions          JSONB DEFAULT '[]',
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cases_select" ON public.cases
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "cases_insert" ON public.cases
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "cases_update" ON public.cases
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "cases_delete" ON public.cases
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- ════════════════════════════════════════════════════
-- 3. TRIGGER: สร้าง profile อัตโนมัติเมื่อ user ลงทะเบียนผ่าน Supabase Auth
--    (fallback — แอปก็ insert เองด้วย แต่ trigger ป้องกัน race condition)
-- ════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, dept)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'dept', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
