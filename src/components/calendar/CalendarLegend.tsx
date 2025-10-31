import { Card } from "@/components/ui/card";

export function CalendarLegend() {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap gap-8 items-center justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#FEE2E2] border border-gray-200" />
          <span className="text-muted-foreground font-medium">Holiday</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-[#A78BFA]" />
          <span className="text-muted-foreground font-medium">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-[#C4B5FD]" />
          <span className="text-muted-foreground font-medium">Selected</span>
        </div>
      </div>
    </Card>
  );
}
