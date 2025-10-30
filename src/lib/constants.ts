export const STATUS_COLORS = {
  pending_verification: 'bg-warning text-warning-foreground',
  verified: 'bg-info text-info-foreground',
  approved: 'bg-success text-success-foreground',
  reviewed: 'bg-info text-info-foreground',
  rejected: 'bg-destructive text-destructive-foreground',
} as const;

export const STATUS_LABELS = {
  pending_verification: 'Pending Verification',
  verified: 'Verified',
  approved: 'Approved',
  reviewed: 'Reviewed',
  rejected: 'Rejected',
} as const;