export const STATUS_COLORS = {
  pending_verification: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
  supervisor_verified: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  hr_certified: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  bod_approved: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
} as const;

export const STATUS_LABELS = {
  pending_verification: 'Pending Verification',
  supervisor_verified: 'Verified by Supervisor',
  hr_certified: 'Certified by HR',
  bod_approved: 'Approved by BOD',
  rejected: 'Rejected',
} as const;