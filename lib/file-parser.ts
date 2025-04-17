import type { LogEntry, HabitFrequency } from "./types"

export function parseLogFile(content: string): LogEntry[] {
  const lines = content.split("\n").filter((line) => line.trim() !== "")

  return lines
    .map((line) => {
      const parts = line.split(" : ").map((part) => part.trim())

      if (parts.length < 3) {
        console.error("Invalid log entry format:", line)
        return null
      }

      const [date, habit, completed] = parts

      return {
        date,
        habit,
        completed: completed.toLowerCase() === "y",
      }
    })
    .filter((entry) => entry !== null) as LogEntry[]
}

export function parseHabitsFile(content: string): HabitFrequency[] {
  const lines = content.split("\n").filter((line) => {
    const trimmed = line.trim()
    return trimmed !== "" && !trimmed.startsWith("#")
  })

  return lines
    .map((line) => {
      const parts = line.split(":").map((part) => part.trim())

      if (parts.length < 2) {
        console.error("Invalid habit format:", line)
        return null
      }

      const [name, frequency] = parts

      return {
        name,
        frequency,
      }
    })
    .filter((habit) => habit !== null) as HabitFrequency[]
}
