-- 1. منح الصلاحيات الأساسية للمستخدم المسجل (authenticated)
GRANT SELECT, UPDATE, DELETE ON TABLE public.messages TO authenticated;
GRANT ALL ON TABLE public.apps TO authenticated;
GRANT ALL ON TABLE public.posts TO authenticated;
GRANT ALL ON TABLE public.releases TO authenticated;

-- 2. تفعيل وضبط سياسات الأمان (RLS) لجدول الرسائل بحيث لا يراها ولا يديرها إلا المالك حصراً
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_select_messages" ON public.messages;
CREATE POLICY "owner_select_messages" ON public.messages
  FOR SELECT TO authenticated
  USING (public.is_owner());

DROP POLICY IF EXISTS "owner_update_messages" ON public.messages;
CREATE POLICY "owner_update_messages" ON public.messages
  FOR UPDATE TO authenticated
  USING (public.is_owner())
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "owner_delete_messages" ON public.messages;
CREATE POLICY "owner_delete_messages" ON public.messages
  FOR DELETE TO authenticated
  USING (public.is_owner());
