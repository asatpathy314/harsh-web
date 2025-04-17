"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { HabitData } from "@/lib/types"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { format, parseISO, eachWeekOfInterval, endOfWeek, eachDayOfInterval } from "date-fns"

interface HabitTrendsProps {
  data: HabitData
}

export function HabitTrends({ data }: HabitTrendsProps) {
  const { habitSummaries, logEntriesByDate, dateRange } = data
  const [selectedHabit, setSelectedHabit] = useState<string>("all")
  const [timeframe, setTimeframe] = useState<string>("weekly")

  // Get all dates in the range
  const startDate = parseISO(dateRange.start)
  const endDate = parseISO(dateRange.end)

  // Prepare data for the trends chart
  const prepareWeeklyData = () => {
    const weeks = eachWeekOfInterval({ start: startDate, end: endDate })

    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart)
      const weekLabel = `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`

      // Get all days in this week
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

      // Calculate completion rates for this week
      const habitCompletions: Record<string, { completed: number; total: number }> = {}

      // Initialize with all habits
      habitSummaries.forEach((habit) => {
        habitCompletions[habit.name] = { completed: 0, total: 0 }
      })

      // Count completions for each day in the week
      daysInWeek.forEach((day) => {
        const dateStr = format(day, "yyyy-MM-dd")
        const entriesForDate = logEntriesByDate[dateStr] || []

        entriesForDate.forEach((entry) => {
          if (habitCompletions[entry.habit]) {
            habitCompletions[entry.habit].total++
            if (entry.completed) {
              habitCompletions[entry.habit].completed++
            }
          }
        })
      })

      // Calculate completion rates
      const result: Record<string, number> = {
        week: weekLabel,
      }

      // Add individual habit completion rates
      Object.entries(habitCompletions).forEach(([habit, counts]) => {
        result[habit] = counts.total > 0 ? (counts.completed / counts.total) * 100 : 0
      })

      // Add overall completion rate
      if (selectedHabit === "all") {
        const totalCompleted = Object.values(habitCompletions).reduce((sum, counts) => sum + counts.completed, 0)
        const totalEntries = Object.values(habitCompletions).reduce((sum, counts) => sum + counts.total, 0)
        result.overall = totalEntries > 0 ? (totalCompleted / totalEntries) * 100 : 0
      }

      return result
    })
  }

  const prepareDailyData = () => {
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    return days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd")
      const dayLabel = format(day, "MMM d")
      const entriesForDate = logEntriesByDate[dateStr] || []

      const result: Record<string, any> = {
        day: dayLabel,
        date: dateStr,
      }

      // Add individual habit completion status
      habitSummaries.forEach((habit) => {
        const entry = entriesForDate.find((e) => e.habit === habit.name)
        result[habit.name] = entry ? (entry.completed ? 100 : 0) : null
      })

      // Add overall completion rate
      if (selectedHabit === "all") {
        const completedCount = entriesForDate.filter((entry) => entry.completed).length
        const totalCount = entriesForDate.length
        result.overall = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
      }

      return result
    })
  }

  const chartData = timeframe === "weekly" ? prepareWeeklyData() : prepareDailyData()

  // Determine which lines to show
  const getLines = () => {
    if (selectedHabit === "all") {
      return [{ id: "overall", name: "Overall", color: "hsl(var(--chart-1))" }]
    } else {
      return [{ id: selectedHabit, name: selectedHabit, color: "hsl(var(--chart-1))" }]
    }
  }

  const lines = getLines()

  // Create config object for ChartContainer
  const chartConfig: Record<string, { label: string; color: string }> = {}
  lines.forEach((line) => {
    chartConfig[line.id] = { label: line.name, color: line.color }
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Habit Trends</CardTitle>
              <CardDescription>Track your habit completion trends over time</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
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

              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ChartContainer config={chartConfig} className="h-full">
            {timeframe === "weekly" ? (
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" angle={-45} textAnchor="end" height={60} tickMargin={20} />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {lines.map((line) => (
                  <Line
                    key={line.id}
                    type="monotone"
                    dataKey={line.id}
                    stroke={`var(--color-${line.id})`}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" angle={-45} textAnchor="end" height={60} tickMargin={20} minTickGap={15} />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {lines.map((line) => (
                  <Area
                    key={line.id}
                    type="monotone"
                    dataKey={line.id}
                    stroke={`var(--color-${line.id})`}
                    fill={`var(--color-${line.id})`}
                    fillOpacity={0.2}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </AreaChart>
            )}
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Habit Insights</CardTitle>
          <CardDescription>Key insights based on your habit data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Most Consistent Habit */}
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <h3 className="font-medium text-green-800 dark:text-green-300 mb-1">Most Consistent Habit</h3>
              <p className="text-green-700 dark:text-green-400">
                <span className="font-bold">{sortedByConsistency(habitSummaries)[0]?.name}</span> is your most
                consistent habit with a {sortedByConsistency(habitSummaries)[0]?.completionRate.toFixed(1)}% completion
                rate.
              </p>
            </div>

            {/* Needs Improvement */}
            {habitSummaries.find((h) => h.completionRate < 50) && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <h3 className="font-medium text-amber-800 dark:text-amber-300 mb-1">Needs Improvement</h3>
                <p className="text-amber-700 dark:text-amber-400">
                  <span className="font-bold">{sortedByConsistency(habitSummaries).reverse()[0]?.name}</span> has the
                  lowest completion rate at{" "}
                  {sortedByConsistency(habitSummaries).reverse()[0]?.completionRate.toFixed(1)}%. Consider adjusting
                  your goals or finding ways to make this habit easier.
                </p>
              </div>
            )}

            {/* Streak Insight */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Streak Insight</h3>
              <p className="text-blue-700 dark:text-blue-400">
                You're currently on a{" "}
                {
                  habitSummaries.find(
                    (h) => h.currentStreak === Math.max(...habitSummaries.map((h) => h.currentStreak)),
                  )?.currentStreak
                }
                -day streak with{" "}
                <span className="font-bold">
                  {
                    habitSummaries.find(
                      (h) => h.currentStreak === Math.max(...habitSummaries.map((h) => h.currentStreak)),
                    )?.name
                  }
                </span>
                . Your longest ever streak is{" "}
                {
                  habitSummaries.find(
                    (h) => h.longestStreak === Math.max(...habitSummaries.map((h) => h.longestStreak)),
                  )?.longestStreak
                }{" "}
                days with{" "}
                <span className="font-bold">
                  {
                    habitSummaries.find(
                      (h) => h.longestStreak === Math.max(...habitSummaries.map((h) => h.longestStreak)),
                    )?.name
                  }
                </span>
                .
              </p>
            </div>

            {/* Overall Progress */}
            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <h3 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Overall Progress</h3>
              <p className="text-purple-700 dark:text-purple-400">
                Your overall habit completion rate is{" "}
                <span className="font-bold">{data.overallCompletion.toFixed(1)}%</span> across {habitSummaries.length}{" "}
                habits over {dateRange.days} days.{" "}
                {data.overallCompletion >= 80
                  ? "Great job maintaining your habits!"
                  : data.overallCompletion >= 50
                    ? "You're making good progress!"
                    : "Keep working on building consistency."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to sort habits by completion rate
function sortedByConsistency(habits: any[]) {
  return [...habits].sort((a, b) => b.completionRate - a.completionRate)
}
