import type { Todo } from './types'
import { dateKey, midnight, todayKey } from './dates'

const MS_PER_DAY = 86_400_000

export interface DayBucket {
  key: string // 'YYYY-MM-DD'
  label: string // short weekday, e.g. 'Mon'
  count: number
}

export interface Analytics {
  days: DayBucket[] // oldest → newest, ends today
  doneToday: number
  doneThisWeek: number
  doneTotal: number
  currentStreak: number // consecutive days ending today (or yesterday) with ≥1 completion
  longestStreak: number
}

/** Epoch ms for local midnight `offset` days from today. */
function dayMidnight(offset: number): number {
  return midnight(todayKey()) + offset * MS_PER_DAY
}

export function computeAnalytics(todos: Todo[], windowDays = 7): Analytics {
  // Bucket completions by local day key. Completions before tracking began
  // (i.e. with no timestamp) can't be dated, so they only count toward totals.
  const byDay = new Map<string, number>()
  let doneTotal = 0

  for (const t of todos) {
    if (!t.done) continue
    doneTotal++
    if (t.completedAt !== undefined) {
      const key = dateKey(new Date(t.completedAt))
      byDay.set(key, (byDay.get(key) ?? 0) + 1)
    }
  }

  // Fixed window of the last `windowDays` days, oldest → newest.
  const days: DayBucket[] = []
  for (let i = windowDays - 1; i >= 0; i--) {
    const ms = dayMidnight(-i)
    const key = dateKey(new Date(ms))
    days.push({
      key,
      label: new Date(ms).toLocaleDateString(undefined, { weekday: 'short' }),
      count: byDay.get(key) ?? 0,
    })
  }

  const today = todayKey()
  const yesterday = dateKey(new Date(dayMidnight(-1)))
  const doneToday = byDay.get(today) ?? 0
  const doneThisWeek = days.reduce((sum, d) => sum + d.count, 0)

  // Streaks: walk backwards day by day. A streak is "alive" if it includes
  // today or yesterday (yesterday keeps it alive until the day ends).
  const countOn = (key: string) => byDay.get(key) ?? 0

  let currentStreak = 0
  if (countOn(today) > 0 || countOn(yesterday) > 0) {
    const startOffset = countOn(today) > 0 ? 0 : -1
    for (let off = startOffset; ; off--) {
      if (countOn(dateKey(new Date(dayMidnight(off)))) > 0) currentStreak++
      else break
    }
  }

  // Longest streak: scan all days that ever had a completion.
  let longestStreak = 0
  const activeKeys = [...byDay.keys()].sort()
  let run = 0
  let prevMs: number | undefined
  for (const key of activeKeys) {
    const ms = midnight(key)
    run = prevMs !== undefined && ms - prevMs === MS_PER_DAY ? run + 1 : 1
    if (run > longestStreak) longestStreak = run
    prevMs = ms
  }

  return { days, doneToday, doneThisWeek, doneTotal, currentStreak, longestStreak }
}
