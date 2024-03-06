import dayjs from 'dayjs'


export function hoursBetweenExcludingWeekends(startDateStr, endDateStr) {
    const shortcutDateFormat = 'MMM D YYYY, h:mm A' // Ensure this matches Day.js formatting tokens
    const startDate = dayjs(startDateStr, shortcutDateFormat)
    let endDate = endDateStr ? dayjs(endDateStr, shortcutDateFormat) : dayjs()

    let hours = 0
    let currentDate = startDate.clone()
    while (currentDate.isBefore(endDate)) {
        if (currentDate.day() !== 0 && currentDate.day() !== 6) { // 0 is Sunday, 6 is Saturday
            hours += 24
        }
        currentDate = currentDate.add(1, 'day')
    }

    if (startDate.day() !== 0 && startDate.day() !== 6) {
        hours -= startDate.hour() + startDate.minute() / 60
    }

    if (endDate.day() !== 0 && endDate.day() !== 6) {
        hours += endDate.hour() + endDate.minute() / 60
    }

    return hours
}
