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
        caption_label: "text-sm font-bold text-black",
        nav: "flex items-center gap-1",
        button_previous: "absolute left-1 top-0 inline-flex items-center justify-center rounded-none w-7 h-7 bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-black transition-colors",
        button_next: "absolute right-1 top-0 inline-flex items-center justify-center rounded-none w-7 h-7 bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-black transition-colors",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-neutral-500 rounded-none w-9 font-bold tracking-wider text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center",
        day_button: "h-8 w-8 p-0 font-medium rounded-none hover:bg-neutral-100 hover:text-black transition-colors inline-flex items-center justify-center",
        selected: "[&>button]:bg-black [&>button]:text-white [&>button]:hover:bg-neutral-800 [&>button]:font-bold",
        today: "[&>button]:bg-neutral-100 [&>button]:text-black [&>button]:font-bold border border-black",
        outside: "text-neutral-400 [&>button]:text-neutral-400 [&>button]:hover:bg-neutral-50",
        disabled: "text-neutral-300 [&>button]:text-neutral-300 [&>button]:hover:bg-transparent [&>button]:cursor-not-allowed",
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
