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

export interface Profile {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  department_id: string | null;
  basic_salary: number;
  employment_type: string | null;
  designation: string | null;
  position: string | null;
  supervisor_id: string | null;
  joining_date: string | null;
  work_location: string | null;
  state: string | null;
  status: string;
  user_roles?: Array<{ role: AppRole }>;
  department?: { id: string; name: string; code: string } | null;
  created_at: string;
  updated_at: string;
}