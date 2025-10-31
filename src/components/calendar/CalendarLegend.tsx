import { Card } from "@/components/ui/card";

export function CalendarLegend() {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap gap-6 items-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive/20 border-2 border-destructive/40" />
          <span className="text-muted-foreground">Holiday</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-info" />
          <span className="text-muted-foreground">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-primary/60" />
          <span className="text-muted-foreground">Selected</span>
        </div>
      </div>
    </Card>
  );
}
