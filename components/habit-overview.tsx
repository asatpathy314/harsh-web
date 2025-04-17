"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { HabitData } from "@/lib/types"
import { CheckCircle, XCircle, TrendingUp, Award, Calendar } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface HabitOverviewProps {
  data: HabitData
}

export function HabitOverview({ data }: HabitOverviewProps) {
  const { habitSummaries, overallCompletion, dateRange } = data

  // Sort habits by completion rate
  const sortedHabits = [...habitSummaries].sort((a, b) => b.completionRate - a.completionRate)

  // Prepare data for pie chart
  const pieData = [
    { name: "Completed", value: overallCompletion },
    { name: "Missed", value: 100 - overallCompletion },
  ]

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))"]

  // Prepare data for bar chart
  const barData = sortedHabits.map((habit) => ({
    name: habit.name,
    completed: habit.completionRate,
    target: habit.targetRate,
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallCompletion.toFixed(1)}%</div>
            <Progress value={overallCompletion} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{habitSummaries.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Tracking {habitSummaries.filter((h) => h.frequency.includes("/")).length} with frequency goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.max(...habitSummaries.map((h) => h.currentStreak))} days</div>
            <p className="text-xs text-muted-foreground mt-2">
              {
                habitSummaries.find((h) => h.currentStreak === Math.max(...habitSummaries.map((h) => h.currentStreak)))
                  ?.name
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dateRange.days} days</div>
            <p className="text-xs text-muted-foreground mt-2">
              {dateRange.start} to {dateRange.end}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Completion Distribution</CardTitle>
            <CardDescription>Overall habit completion rate</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Habit Completion Rates</CardTitle>
            <CardDescription>Completion rate by habit</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{
                completed: {
                  label: "Completed",
                  color: "hsl(var(--chart-1))",
                },
                target: {
                  label: "Target",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-full"
            >
              <BarChart data={barData} layout="vertical" margin={{ top: 20, right: 30, left: 70, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={60}
                  tickFormatter={(value) => (value.length > 10 ? `${value.substring(0, 10)}...` : value)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="completed" fill="var(--color-completed)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="target" fill="var(--color-target)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Habit Details</CardTitle>
          <CardDescription>Detailed information about each habit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedHabits.map((habit) => (
              <Card key={habit.name} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    {habit.completionRate >= 80 ? (
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    ) : habit.completionRate >= 50 ? (
                      <TrendingUp className="h-4 w-4 mr-2 text-amber-500" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2 text-red-500" />
                    )}
                    {habit.name}
                  </CardTitle>
                  <CardDescription>{habit.frequency}</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Completion</span>
                    <span className="text-sm font-medium">{habit.completionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={habit.completionRate} className="mb-4" />

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-muted-foreground mr-1">Streak:</span>
                      <span className="font-medium">{habit.currentStreak}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-muted-foreground mr-1">Total:</span>
                      <span className="font-medium">{habit.totalCompletions}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
