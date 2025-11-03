import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';

interface ResubmissionBadgeProps {
  resubmissionCount: number;
  isResubmission: boolean;
}

export function ResubmissionBadge({ resubmissionCount, isResubmission }: ResubmissionBadgeProps) {
  if (!isResubmission) return null;

  return (
    <Badge variant="outline" className="gap-1">
      <RotateCcw className="h-3 w-3" />
      Resubmission #{resubmissionCount}
    </Badge>
  );
}
