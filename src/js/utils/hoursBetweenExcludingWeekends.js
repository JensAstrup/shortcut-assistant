import dayjs from 'dayjs'


/**
 * Calculates the total number of hours between two dates, excluding weekends.
 *
 * @param {string} startStr - The start date in string format.
 * @param {string} [endStr] - The end date in string format.
 * @returns {number} The total hours between the start and end dates, excluding Saturdays and Sundays.
 */
export function hoursBetweenExcludingWeekends(startStr, endStr) {
    const start = new Date(startStr)
    let end = new Date(endStr)

    let hours = 0.0

    let current = new Date(start)
    while (current < end) {
        // Initialize nextDayStart at the beginning of each loop iteration
        let nextDayStart = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1)

        if (current.getDay() !== 0 && current.getDay() !== 6) { // Excludes Saturday (6) and Sunday (0)
            let dailyEnd = new Date(Math.min(end.getTime(), nextDayStart.getTime()))
            let dailyHours = (dailyEnd - current) / 3600000 // Convert milliseconds to hours
            hours += dailyHours
        }

        // Move to start of the next day
        current = nextDayStart
    }

    return hours
}
