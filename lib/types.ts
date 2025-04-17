export interface LogEntry {
  date: string
  habit: string
  completed: boolean
}

export interface HabitFrequency {
  name: string
  frequency: string
}

export interface HabitSummary {
  name: string
  frequency: string
  completionRate: number
  targetRate: number
  currentStreak: number
  longestStreak: number
  totalCompletions: number
}

export interface HabitData {
  habitSummaries: HabitSummary[]
  logEntriesByDate: Record<string, LogEntry[]>
  overallCompletion: number
  dateRange: {
    start: string
    end: string
    days: number
  }
}
