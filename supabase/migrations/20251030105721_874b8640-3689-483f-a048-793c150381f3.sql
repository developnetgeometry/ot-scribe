-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_rate_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_approval_thresholds ENABLE ROW LEVEL SECURITY;

-- Departments policies
DROP POLICY IF EXISTS dep_read ON public.departments;
CREATE POLICY dep_read ON public.departments 
  FOR SELECT TO authenticated 
  USING (true);

DROP POLICY IF EXISTS dep_admin ON public.departments;
CREATE POLICY dep_admin ON public.departments 
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- Profiles policies
DROP POLICY IF EXISTS prof_self_read ON public.profiles;
CREATE POLICY prof_self_read ON public.profiles 
  FOR SELECT TO authenticated 
  USING (id = auth.uid());

DROP POLICY IF EXISTS prof_hr_read ON public.profiles;
CREATE POLICY prof_hr_read ON public.profiles 
  FOR SELECT TO authenticated 
  USING (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS prof_hr_write ON public.profiles;
CREATE POLICY prof_hr_write ON public.profiles 
  FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS prof_hr_update ON public.profiles;
CREATE POLICY prof_hr_update ON public.profiles 
  FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'));

-- User roles policies
DROP POLICY IF EXISTS roles_self ON public.user_roles;
CREATE POLICY roles_self ON public.user_roles 
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS roles_admin ON public.user_roles;
CREATE POLICY roles_admin ON public.user_roles 
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- Public holidays policies
DROP POLICY IF EXISTS hol_read ON public.public_holidays;
CREATE POLICY hol_read ON public.public_holidays 
  FOR SELECT TO authenticated 
  USING (true);

DROP POLICY IF EXISTS hol_admin ON public.public_holidays;
CREATE POLICY hol_admin ON public.public_holidays 
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- OT Settings policies
DROP POLICY IF EXISTS set_read ON public.ot_settings;
CREATE POLICY set_read ON public.ot_settings 
  FOR SELECT TO authenticated 
  USING (true);

DROP POLICY IF EXISTS set_admin ON public.ot_settings;
CREATE POLICY set_admin ON public.ot_settings 
  FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- OT Requests policies
DROP POLICY IF EXISTS otr_emp_read ON public.ot_requests;
CREATE POLICY otr_emp_read ON public.ot_requests 
  FOR SELECT TO authenticated 
  USING (employee_id = auth.uid());

DROP POLICY IF EXISTS otr_emp_insert ON public.ot_requests;
CREATE POLICY otr_emp_insert ON public.ot_requests 
  FOR INSERT TO authenticated 
  WITH CHECK (employee_id = auth.uid());

DROP POLICY IF EXISTS otr_sup_read ON public.ot_requests;
CREATE POLICY otr_sup_read ON public.ot_requests 
  FOR SELECT TO authenticated 
  USING (supervisor_id = auth.uid() OR public.has_role(auth.uid(), 'supervisor'));

DROP POLICY IF EXISTS otr_hr_read ON public.ot_requests;
CREATE POLICY otr_hr_read ON public.ot_requests 
  FOR SELECT TO authenticated 
  USING (
    public.has_role(auth.uid(), 'hr') OR 
    public.has_role(auth.uid(), 'bod') OR 
    public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS otr_sup_update ON public.ot_requests;
CREATE POLICY otr_sup_update ON public.ot_requests 
  FOR UPDATE TO authenticated 
  USING (supervisor_id = auth.uid() OR public.has_role(auth.uid(), 'supervisor'));

DROP POLICY IF EXISTS otr_hr_update ON public.ot_requests;
CREATE POLICY otr_hr_update ON public.ot_requests 
  FOR UPDATE TO authenticated 
  USING (
    public.has_role(auth.uid(), 'hr') OR 
    public.has_role(auth.uid(), 'bod') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Eligibility Rules policies
DROP POLICY IF EXISTS rules_read ON public.ot_eligibility_rules;
CREATE POLICY rules_read ON public.ot_eligibility_rules 
  FOR SELECT TO authenticated 
  USING (is_active = true);

DROP POLICY IF EXISTS rules_write ON public.ot_eligibility_rules;
CREATE POLICY rules_write ON public.ot_eligibility_rules 
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'));

-- Rate Formulas policies
DROP POLICY IF EXISTS form_read ON public.ot_rate_formulas;
CREATE POLICY form_read ON public.ot_rate_formulas 
  FOR SELECT TO authenticated 
  USING (is_active = true);

DROP POLICY IF EXISTS form_write ON public.ot_rate_formulas;
CREATE POLICY form_write ON public.ot_rate_formulas 
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'));

-- Approval Thresholds policies
DROP POLICY IF EXISTS th_read ON public.ot_approval_thresholds;
CREATE POLICY th_read ON public.ot_approval_thresholds 
  FOR SELECT TO authenticated 
  USING (is_active = true);

DROP POLICY IF EXISTS th_write ON public.ot_approval_thresholds;
CREATE POLICY th_write ON public.ot_approval_thresholds 
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'));