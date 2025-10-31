import { TrendingUp } from 'lucide-react';

interface InsightBannerProps {
  avgOTPerMember: number;
  teamMembersCount: number;
}

export function InsightBanner({ avgOTPerMember, teamMembersCount }: InsightBannerProps) {
  const getInsightMessage = () => {
    if (teamMembersCount === 0) {
      return "No team members assigned yet.";
    }

    const avgFormatted = avgOTPerMember.toFixed(1);
    
    if (avgOTPerMember > 15) {
      return `Your team's average OT this month is ${avgFormatted} hours per member — slightly above company average. Great job managing workloads efficiently!`;
    } else if (avgOTPerMember > 10) {
      return `Your team's average OT this month is ${avgFormatted} hours per member — right on track with company standards. Keep up the good work!`;
    } else {
      return `Your team's average OT this month is ${avgFormatted} hours per member — below company average. Excellent work-life balance management!`;
    }
  };

  return (
    <div className="rounded-xl p-6 shadow-lg bg-gradient-to-br from-info to-info/80 text-info-foreground mt-6">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-info-foreground/20 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">Performance Insight</h3>
          <p className="text-info-foreground/90">
            {getInsightMessage()}
          </p>
        </div>
      </div>
    </div>
  );
}
