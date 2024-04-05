import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import minMax from 'dayjs/plugin/minMax'
import weekday from 'dayjs/plugin/weekday'

dayjs.extend(weekday)
dayjs.extend(isSameOrBefore)
dayjs.extend(minMax)

export function hoursBetweenExcludingWeekends(startStr: string, endStr: string): number {
  const start = dayjs(startStr)
  const end = dayjs(endStr)

  let hours = 0.0

  let current = start
  while (current.isSameOrBefore(end)) {
    // Initialize nextDayStart at the beginning of each loop iteration
    const nextDayStart = current.add(1, 'day').startOf('day')

    if (current.weekday() !== 0 && current.weekday() !== 6) { // Excludes Saturday (6) and Sunday (0)
      const dailyEnd = dayjs.min(end, nextDayStart)
      if (dailyEnd) {
        const dailyHours = dailyEnd.diff(current, 'hour', true)
        hours += dailyHours
      }
    }

    // Move to start of the next day
    current = nextDayStart
  }

  return hours
}
