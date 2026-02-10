import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-gray-900",
        nav: "flex items-center gap-1",
        button_previous: "absolute left-1 top-0 inline-flex items-center justify-center rounded-lg w-7 h-7 bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors",
        button_next: "absolute right-1 top-0 inline-flex items-center justify-center rounded-lg w-7 h-7 bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center",
        day_button: "h-8 w-8 p-0 font-normal rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center",
        selected: "[&>button]:bg-gray-900 [&>button]:text-white [&>button]:hover:bg-gray-800 [&>button]:font-medium",
        today: "[&>button]:bg-gray-100 [&>button]:text-gray-900 [&>button]:font-semibold",
        outside: "text-gray-400 [&>button]:text-gray-400 [&>button]:hover:bg-gray-50",
        disabled: "text-gray-300 [&>button]:text-gray-300 [&>button]:hover:bg-transparent [&>button]:cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
export type { CalendarProps }
