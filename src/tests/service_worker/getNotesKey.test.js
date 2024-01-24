import {getNotesKey} from '../../js/serviceWorker/notes';

describe('getNotesKey', () => {
    test('get notes returns correct key', () => {
        const storyId = 123;
        const expectedKey = "notes_123";

        const actualKey = getNotesKey(storyId);
        expect(actualKey).toBe(expectedKey);
    })
})
