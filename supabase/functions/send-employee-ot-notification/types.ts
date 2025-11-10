/**
 * TypeScript type definitions for Employee OT Notification Service
 *
 * This module defines the interfaces used by the send-employee-ot-notification
 * Edge Function for handling approval/rejection notifications to employees.
 */

/**
 * Input payload for sending employee OT notifications
 */
export interface EmployeeOTNotificationPayload {
  requestId: string;
  notificationType: 'approved' | 'rejected';
}

/**
 * Result of employee notification sending operation
 */
export interface NotificationResult {
  success: boolean;
  notificationsSent: number;
  message?: string;
  details?: string;
}

/**
 * OT request details from database
 */
export interface OTRequestDetails {
  id: string;
  employee_id: string;
  ot_date: string;
  total_hours: number;
  status: string;
  supervisor_id: string | null;
  hr_id: string | null;
  supervisor_remarks: string | null;
  hr_remarks: string | null;
  management_remarks: string | null;
}

/**
 * Employee profile information
 */
export interface EmployeeProfile {
  id: string;
  full_name: string;
  employee_id: string;
}

/**
 * Supervisor/Approver information
 */
export interface ApproverInfo {
  id: string;
  full_name: string;
}

/**
 * Error response format
 */
export interface ErrorResponse {
  success: false;
  error: string;
  details?: string | Record<string, unknown>;
}
