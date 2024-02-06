/**
 * @jest-environment jsdom
 */

import { clearCycleTime } from './contentScript';

describe('clearCycleTime', () => {
    it('should remove cycleTimeDiv from the document if it exists', () => {
        document.body.innerHTML = `<div class="story-date-cycle-time"></div>`;
        
        clearCycleTime();

        const cycleTimeDiv = document.querySelector('.story-date-cycle-time');
        expect(cycleTimeDiv).toBeNull();
    });

    it('should not throw an error if cycleTimeDiv does not exist in the document', () => {
        document.body.innerHTML = '';
        
        expect(clearCycleTime).not.toThrow();
    });
});