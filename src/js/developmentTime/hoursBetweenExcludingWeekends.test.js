/**
 * @jest-environment jsdom
 */
import { hoursBetweenExcludingWeekends } from './contentScript'

describe('hoursBetweenExcludingWeekends', () => {
    // Test case: when the dates are both on the same weekday
    test('should return 24 hours for dates that are on the same weekday', () => {
        const start = 'June 26 2023, 1:00 am'
        const end = 'June 27 2023, 1:00 am'
        expect(hoursBetweenExcludingWeekends(start, end)).toEqual(24)
    })

    // Test case: when the dates span a weekend
    test('should return 24 hours for dates that span a weekend', () => {
        const start = 'June 23 2023, 1:00 am'
        const end = 'June 26 2023, 1:00 am'
        expect(hoursBetweenExcludingWeekends(start, end)).toEqual(24)
    })

    // Test case: when the dates are on the same weekend
    test('should return 0 hours for dates that are on the same weekend', () => {
        const start = 'June 24 2023, 1:00 am'
        const end = 'June 25 2023, 1:00 am'
        expect(hoursBetweenExcludingWeekends(start, end)).toEqual(0)
    })
})