import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-1 relative items-center mb-6",
        caption_label: "text-xl font-semibold text-gray-800",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-10 w-10 bg-white hover:bg-gradient-to-r hover:from-[#5F26B4] hover:to-[#8B5CF6] hover:text-white border-gray-200 hover:border-transparent transition-all duration-200",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex gap-4 mb-4",
        head_cell: "text-gray-600 font-semibold text-sm flex-1 text-center",
        row: "flex w-full gap-4 mb-4",
        cell: "flex-1 text-center text-base p-0 relative",
        day: "h-20 w-full p-4 font-medium border border-gray-200 rounded-lg hover:scale-105 hover:shadow-[0_0_10px_rgba(95,38,180,0.15)] transition-all duration-200 aria-selected:opacity-100 bg-white",
        day_range_end: "day-range-end",
        day_selected:
          "ring-2 ring-[#C4B5FD] bg-purple-50",
        day_today: "ring-2 ring-[#A78BFA] bg-gradient-to-br from-purple-50 to-purple-100",
        day_outside:
          "day-outside text-muted-foreground opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
