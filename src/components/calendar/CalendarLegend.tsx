import { Card } from "@/components/ui/card";

export function CalendarLegend() {
  return (
    <Card className="p-6 rounded-xl shadow-md bg-gradient-to-b from-white to-gray-50 border-gray-100">
      <div className="flex flex-wrap gap-8 items-center justify-center text-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FEE2E2] to-[#FECACA] border border-red-200 shadow-sm" />
          <span className="text-gray-700 font-medium">Public Holiday</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E0E7FF] to-[#C7D2FE] border border-indigo-200 shadow-sm" />
          <span className="text-gray-700 font-medium">Weekly Holiday</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FEF9C3] to-[#FEF08A] border border-yellow-200 shadow-sm" />
          <span className="text-gray-700 font-medium">State Holiday</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border-2 border-[#A78BFA] shadow-sm bg-white" />
          <span className="text-gray-700 font-medium">Today</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border-2 border-[#C4B5FD] shadow-sm bg-white" />
          <span className="text-gray-700 font-medium">Selected</span>
        </div>
      </div>
    </Card>
  );
}
