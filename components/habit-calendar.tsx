"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { HabitData } from "@/lib/types"
import { format, parseISO, eachDayOfInterval } from "date-fns"

interface HabitCalendarProps {
  data: HabitData
}

export function HabitCalendar({ data }: HabitCalendarProps) {
  const { habitSummaries, logEntriesByDate } = data
  const [selectedHabit, setSelectedHabit] = useState<string>("all")

  // Get all unique dates from the log entries
  const startDate = parseISO(data.dateRange.start)
  const endDate = parseISO(data.dateRange.end)

  const allDates = eachDayOfInterval({ start: startDate, end: endDate })

  // Group dates by month and year
  const monthGroups: Record<string, Date[]> = {}
  allDates.forEach((date) => {
    const monthYear = format(date, "MMMM yyyy")
    if (!monthGroups[monthYear]) {
      monthGroups[monthYear] = []
    }
    monthGroups[monthYear].push(date)
  })

  // Function to get status for a specific date and habit
  const getStatusForDate = (date: Date, habitName: string) => {
    const dateStr = format(date, "yyyy-MM-dd")
    const entriesForDate = logEntriesByDate[dateStr] || []

    if (habitName === "all") {
      // For "all", check if any habits were completed on this date
      const completedCount = entriesForDate.filter((entry) => entry.completed).length
      const totalCount = entriesForDate.length

      if (totalCount === 0) return "empty"
      const completionRate = (completedCount / totalCount) * 100

      if (completionRate === 100) return "completed"
      if (completionRate >= 50) return "partial"
      return "missed"
    } else {
      // For specific habit, check if it was completed on this date
      const entry = entriesForDate.find((entry) => entry.habit === habitName)
      if (!entry) return "empty"
      return entry.completed ? "completed" : "missed"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Habit Calendar</CardTitle>
              <CardDescription>View your habit completion over time</CardDescription>
            </div>
            <Select value={selectedHabit} onValueChange={setSelectedHabit}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select habit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Habits</SelectItem>
                {habitSummaries.map((habit) => (
                  <SelectItem key={habit.name} value={habit.name}>
                    {habit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {Object.entries(monthGroups).map(([monthYear, dates]) => (
              <div key={monthYear} className="space-y-2">
                <h3 className="font-medium text-lg">{monthYear}</h3>
                <div className="grid grid-cols-7 gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}

                  {/* Add empty cells for the first day of the month */}
                  {Array.from({ length: dates[0].getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {dates.map((date) => {
                    const status = getStatusForDate(date, selectedHabit)
                    let bgColor = "bg-gray-100 dark:bg-gray-800" // empty

                    if (status === "completed") {
                      bgColor = "bg-green-100 dark:bg-green-900"
                    } else if (status === "partial") {
                      bgColor = "bg-amber-100 dark:bg-amber-900"
                    } else if (status === "missed") {
                      bgColor = "bg-red-100 dark:bg-red-900"
                    }

                    return (
                      <div
                        key={date.toISOString()}
                        className={`aspect-square rounded-md flex items-center justify-center ${bgColor} text-xs font-medium`}
                        title={`${format(date, "MMM d, yyyy")}: ${status}`}
                      >
                        {date.getDate()}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center mt-8 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-sm bg-green-100 dark:bg-green-900 mr-2" />
              <span className="text-sm">Completed</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-sm bg-amber-100 dark:bg-amber-900 mr-2" />
              <span className="text-sm">Partial</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-sm bg-red-100 dark:bg-red-900 mr-2" />
              <span className="text-sm">Missed</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-sm bg-gray-100 dark:bg-gray-800 mr-2" />
              <span className="text-sm">No Data</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
