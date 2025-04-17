"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { HabitOverview } from "@/components/habit-overview"
import { HabitCalendar } from "@/components/habit-calendar"
import { HabitStreaks } from "@/components/habit-streaks"
import { HabitTrends } from "@/components/habit-trends"
import { parseLogFile, parseHabitsFile } from "@/lib/file-parser"
import { processHabitData } from "@/lib/data-processor"
import type { HabitData, HabitFrequency, LogEntry } from "@/lib/types"
import { FileUpload } from "@/components/file-upload"
import { DemoData } from "@/components/demo-data"

export function HabitDashboard() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])
  const [habitFrequencies, setHabitFrequencies] = useState<HabitFrequency[]>([])
  const [habitData, setHabitData] = useState<HabitData | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    if (logEntries.length > 0 && habitFrequencies.length > 0) {
      const processedData = processHabitData(logEntries, habitFrequencies)
      setHabitData(processedData)
      setHasData(true)
    }
  }, [logEntries, habitFrequencies])

  const handleLogFileUpload = (content: string) => {
    setIsLoading(true)
    const entries = parseLogFile(content)
    setLogEntries(entries)
    setIsLoading(false)
  }

  const handleHabitsFileUpload = (content: string) => {
    setIsLoading(true)
    const frequencies = parseHabitsFile(content)
    setHabitFrequencies(frequencies)
    setIsLoading(false)
  }

  const loadDemoData = () => {
    setIsLoading(true)
    const demoLogEntries = parseLogFile(DemoData.logFile)
    const demoHabitFrequencies = parseHabitsFile(DemoData.habitsFile)

    setLogEntries(demoLogEntries)
    setHabitFrequencies(demoHabitFrequencies)
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Habit Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your habits and visualize your progress over time.</p>
        </div>

        {!hasData ? (
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Upload your habit log and configuration files to visualize your progress.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="log-file">Log File</Label>
                  <FileUpload
                    id="log-file"
                    onFileContent={handleLogFileUpload}
                    label="Upload Log File"
                  />
                  {logEntries.length > 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✓ Loaded {logEntries.length} log entries
                    </p>
                  )}
                </div>
                <div className="space-y-4">
                  <Label htmlFor="habits-file">Habits Configuration</Label>
                  <FileUpload
                    id="habits-file"
                    onFileContent={handleHabitsFileUpload}
                    label="Upload Habits File"
                  />
                  {habitFrequencies.length > 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✓ Loaded {habitFrequencies.length} habit configurations
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-center">
                <Button variant="outline" onClick={loadDemoData} disabled={isLoading}>
                  {isLoading ? "Loading..." : "Use Demo Data"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="streaks">Streaks</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>
              <Button
                variant="outline"
                onClick={() => {
                  setLogEntries([])
                  setHabitFrequencies([])
                  setHabitData(null)
                  setHasData(false)
                }}
              >
                Reset Data
              </Button>
            </div>

            <TabsContent value="overview" className="space-y-6">
              {habitData && <HabitOverview data={habitData} />}
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              {habitData && <HabitCalendar data={habitData} />}
            </TabsContent>

            <TabsContent value="streaks" className="space-y-6">
              {habitData && <HabitStreaks data={habitData} />}
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              {habitData && <HabitTrends data={habitData} />}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
