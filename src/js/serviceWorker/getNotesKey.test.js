import { getNotesKey } from './notes';

describe('getNotesKey', () => {
  it('should return the correct notes key for given storyId', () => {
    const storyId = '1234';
    const expectedNotesKey = 'notes_1234';

    const actualNotesKey = getNotesKey(storyId);

    expect(actualNotesKey).toEqual(expectedNotesKey);
  }); 
});