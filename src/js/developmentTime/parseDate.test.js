/**
 * @jest-environment jsdom
 */

import { parseDate } from './contentScript.js';


describe('parseDate function from contentScript.js', () => {
    it('Should parse the date string in the given format (Month Day Year HH:MM AM/PM) and return a Date object', () => {
        
        let testDateString1 = "Dec 9 2023, 4:28 pm";
        let expectedDate1 = new Date("Dec 9 2023, 16:28");
        expect(parseDate(testDateString1)).toEqual(expectedDate1);
        
        let testDateString2 = "Jan 1 2000, 12:34 am";
        let expectedDate2 = new Date("Jan 1 2000, 00:34");
        expect(parseDate(testDateString2)).toEqual(expectedDate2);
        
        let testDateString3 = "Jun 15 2021, 11:00 pm";
        let expectedDate3 = new Date("Jun 15 2021, 23:00");
        expect(parseDate(testDateString3)).toEqual(expectedDate3);
    });
});