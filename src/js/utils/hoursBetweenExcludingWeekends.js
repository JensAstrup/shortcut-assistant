import moment from 'moment/moment'


export function hoursBetweenExcludingWeekends(startDateStr, endDateStr){
    const shortcutDateFormat = 'MMM D YYYY, h:mm: a'
    const startDate = moment(startDateStr, shortcutDateFormat)
    let endDate = endDateStr ? moment(endDateStr, shortcutDateFormat) : moment()

    let hours = 0
    let currentDate = moment(startDate)
    while (currentDate < endDate) {
        if (currentDate.day() !== 0 && currentDate.day() !== 6) { // 0 is Sunday, 6 is Saturday
            hours += 24
        }
        currentDate.add(1, 'days')
    }

    if (startDate.day() !== 0 && startDate.day() !== 6) {
        hours -= startDate.hours() + startDate.minutes() / 60
    }

    if (endDate.day() !== 0 && endDate.day() !== 6) {
        hours += endDate.hours() + endDate.minutes() / 60
    }

    return hours
}