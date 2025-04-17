"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { HabitData } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Award, Flame, Calendar } from "lucide-react"

interface HabitStreaksProps {
  data: HabitData
}

export function HabitStreaks({ data }: HabitStreaksProps) {
  const { habitSummaries } = data

  // Sort habits by current streak
  const sortedByCurrentStreak = [...habitSummaries].sort((a, b) => b.currentStreak - a.currentStreak)

  // Sort habits by longest streak
  const sortedByLongestStreak = [...habitSummaries].sort((a, b) => b.longestStreak - a.longestStreak)

  // Prepare data for the streak comparison chart
  const streakComparisonData = habitSummaries.map((habit) => ({
    name: habit.name,
    current: habit.currentStreak,
    longest: habit.longestStreak,
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Longest Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Flame className="h-8 w-8 mr-3 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{sortedByCurrentStreak[0]?.currentStreak || 0} days</div>
                <p className="text-sm text-muted-foreground">{sortedByCurrentStreak[0]?.name || "No habits"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Longest Ever Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Award className="h-8 w-8 mr-3 text-amber-500" />
              <div>
                <div className="text-2xl font-bold">{sortedByLongestStreak[0]?.longestStreak || 0} days</div>
                <p className="text-sm text-muted-foreground">{sortedByLongestStreak[0]?.name || "No habits"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-8 w-8 mr-3 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">
                  {habitSummaries.length > 0
                    ? Math.round(
                        habitSummaries.reduce((sum, habit) => sum + habit.currentStreak, 0) / habitSummaries.length,
                      )
                    : 0}{" "}
                  days
                </div>
                <p className="text-sm text-muted-foreground">Across all habits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Streak Comparison</CardTitle>
          <CardDescription>Current vs. longest streaks for each habit</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ChartContainer
            config={{
              current: {
                label: "Current Streak",
                color: "hsl(var(--chart-1))",
              },
              longest: {
                label: "Longest Streak",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-full"
          >
            <BarChart
              data={streakComparisonData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={60}
                tickFormatter={(value) => (value.length > 10 ? `${value.substring(0, 10)}...` : value)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="current" fill="var(--color-current)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="longest" fill="var(--color-longest)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Streak Details</CardTitle>
          <CardDescription>Detailed streak information for each habit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedByCurrentStreak.map((habit) => (
              <Card key={habit.name} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">{habit.name}</CardTitle>
                  <CardDescription>{habit.frequency}</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Current Streak</div>
                      <div className="text-2xl font-bold flex items-center">
                        {habit.currentStreak}
                        {habit.currentStreak >= 5 && <Flame className="h-5 w-5 ml-1 text-orange-500" />}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Longest Streak</div>
                      <div className="text-2xl font-bold flex items-center">
                        {habit.longestStreak}
                        {habit.longestStreak === Math.max(...habitSummaries.map((h) => h.longestStreak)) && (
                          <Award className="h-5 w-5 ml-1 text-amber-500" />
                        )}
                      </div>
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
