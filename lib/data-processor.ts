import type { LogEntry, HabitFrequency, HabitData, HabitSummary } from "./types"
import { parseISO, differenceInDays, isBefore } from "date-fns"

export function processHabitData(logEntries: LogEntry[], habitFrequencies: HabitFrequency[]): HabitData {
  // Group log entries by date
  const logEntriesByDate: Record<string, LogEntry[]> = {}
  logEntries.forEach((entry) => {
    if (!logEntriesByDate[entry.date]) {
      logEntriesByDate[entry.date] = []
    }
    logEntriesByDate[entry.date].push(entry)
  })

  // Get date range
  const dates = Object.keys(logEntriesByDate).sort()
  const startDate = dates[0]
  const endDate = dates[dates.length - 1]
  const days = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1

  // Process each habit
  const habitSummaries: HabitSummary[] = habitFrequencies.map((habitFreq) => {
    const habitEntries = logEntries.filter((entry) => entry.habit === habitFreq.name)
    const completedEntries = habitEntries.filter((entry) => entry.completed)

    // Calculate completion rate
    const completionRate = habitEntries.length > 0 ? (completedEntries.length / habitEntries.length) * 100 : 0

    // Calculate target rate based on frequency
    let targetRate = 100 // Default to 100% for daily habits

    if (habitFreq.frequency.includes("/")) {
      const [target, period] = habitFreq.frequency.split("/").map(Number)
      targetRate = (target / period) * 100
    }

    // Calculate streaks
    const { currentStreak, longestStreak } = calculateStreaks(habitEntries, habitFreq)

    return {
      name: habitFreq.name,
      frequency: habitFreq.frequency,
      completionRate,
      targetRate,
      currentStreak,
      longestStreak,
      totalCompletions: completedEntries.length,
    }
  })

  // Calculate overall completion rate
  const totalEntries = logEntries.length
  const completedEntries = logEntries.filter((entry) => entry.completed).length
  const overallCompletion = totalEntries > 0 ? (completedEntries / totalEntries) * 100 : 0

  return {
    habitSummaries,
    logEntriesByDate,
    overallCompletion,
    dateRange: {
      start: startDate,
      end: endDate,
      days,
    },
  }
}

function calculateStreaks(
  entries: LogEntry[],
  habitFreq: HabitFrequency,
): { currentStreak: number; longestStreak: number } {
  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => {
    return isBefore(parseISO(a.date), parseISO(b.date)) ? -1 : 1
  })

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  // Handle frequency
  const isDaily = habitFreq.frequency === "1"
  const isWeekly = habitFreq.frequency.includes("/")

  if (isDaily) {
    // For daily habits, check consecutive days
    for (let i = sortedEntries.length - 1; i >= 0; i--) {
      if (sortedEntries[i].completed) {
        currentStreak++
      } else {
        break
      }
    }

    // Calculate longest streak
    for (let i = 0; i < sortedEntries.length; i++) {
      if (sortedEntries[i].completed) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }
  } else if (isWeekly) {
    // For weekly frequency habits, this is a simplified approach
    // A more accurate implementation would group by weeks and check targets
    currentStreak = sortedEntries.filter((e) => e.completed).length
    longestStreak = currentStreak
  } else {
    // For other frequencies, just count completed entries
    currentStreak = sortedEntries.filter((e) => e.completed).length
    longestStreak = currentStreak
  }

  return { currentStreak, longestStreak }
}
