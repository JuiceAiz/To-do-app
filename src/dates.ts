/** Shared date helpers. Due dates are local calendar dates ('YYYY-MM-DD' strings), not timestamps. */

const MS_PER_DAY = 86_400_000

/** Today's local calendar date as a 'YYYY-MM-DD' string. */
export function todayKey(): string {
  return dateKey(new Date())
}

/** Local 'YYYY-MM-DD' key for a given Date. */
export function dateKey(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

/** Epoch ms for local midnight on the given 'YYYY-MM-DD' key. */
export function midnight(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

/** Whole days between two local date keys (negative = first is before second). */
export function daysFromToday(key: string): number {
  return Math.round((midnight(key) - midnight(todayKey())) / MS_PER_DAY)
}

/**
 * Compare two keys chronologically; treat empty/undefined (undated) as "no date".
 * Returns 0 if both are undated.
 */
export function compareKeys(a?: string, b?: string): number {
  if (!a && !b) return 0
  if (!a) return 1 // undated sorts after dated
  if (!b) return -1
  return a < b ? -1 : a > b ? 1 : 0
}
