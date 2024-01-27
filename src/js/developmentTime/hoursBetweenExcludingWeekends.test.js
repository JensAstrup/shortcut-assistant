/**
 * @jest-environment jsdom
 */
import { hoursBetweenExcludingWeekends } from './contentScript'

describe('hoursBetweenExcludingWeekends', () => {
    // Test case: when the dates are both on the same weekday
    test('should return 24 hours for dates that are on the same weekday', () => {
        const start = '2023-06-26'
        const end = '2023-06-27'
        expect(hoursBetweenExcludingWeekends(start, end)).toEqual(24)
    })

    // Test case: when the dates span a weekend
    test('should return 24 hours for dates that span a weekend', () => {
        const start = '2023-06-23'
        const end = '2023-06-26'
        expect(hoursBetweenExcludingWeekends(start, end)).toEqual(24)
    })

    // Test case: when the dates are on the same weekend
    test('should return 0 hours for dates that are on the same weekend', () => {
        const start = '2023-06-24'
        const end = '2023-06-25'
        expect(hoursBetweenExcludingWeekends(start, end)).toEqual(0)
    })
})