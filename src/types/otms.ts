export type AppRole = 'employee' | 'supervisor' | 'hr' | 'bod' | 'admin';
export type OTStatus = 'pending_verification' | 'verified' | 'approved' | 'reviewed' | 'rejected';
export type DayType = 'weekday' | 'saturday' | 'sunday' | 'public_holiday';

export interface OTRequest {
  id: string;
  employee_id: string;
  ot_date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  day_type: DayType;
  reason: string;
  attachment_url: string | null;
  orp: number | null;
  hrp: number | null;
  ot_amount: number | null;
  status: OTStatus;
  supervisor_id: string | null;
  supervisor_verified_at: string | null;
  supervisor_remarks: string | null;
  hr_id: string | null;
  hr_approved_at: string | null;
  hr_remarks: string | null;
  bod_reviewed_at: string | null;
  bod_remarks: string | null;
  eligibility_rule_id: string | null;
  formula_id: string | null;
  threshold_violations: any;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  department_id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  employee_count?: number;
}

export interface Profile {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  ic_no: string | null;
  phone_no: string | null;
  department_id: string | null;
  basic_salary: number;
  epf_no: string | null;
  socso_no: string | null;
  income_tax_no: string | null;
  employment_type: string | null;
  designation: string | null;
  position: string | null;
  position_id: string | null;
  supervisor_id: string | null;
  joining_date: string | null;
  work_location: string | null;
  state: string | null;
  status: string;
  is_ot_eligible: boolean;
  user_roles?: Array<{ role: AppRole }>;
  department?: { id: string; name: string; code: string } | null;
  position_obj?: Position | null;
  created_at: string;
  updated_at: string;
}