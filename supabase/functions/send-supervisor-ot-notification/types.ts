/**
 * Type definitions for send-supervisor-ot-notification Edge Function
 */

export interface OTNotificationPayload {
  requestId: string
  employeeId: string
}

export interface NotificationResult {
  success: boolean
  notificationsSent: number
  supervisorsNotified?: number
  failures?: number
  message: string
}

export interface SupervisorInfo {
  id: string
  fullName: string
}

export interface ErrorResponse {
  success: false
  error: string
  details?: string
}
