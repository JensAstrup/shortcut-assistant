// Mock the chrome API
import {getStoryId} from '../../js/service_worker';


global.chrome = {
    tabs: {
        query: jest.fn((queryInfo, callback) => {
            // Mock implementation of chrome.tabs.query
            callback([{ url: 'http://example.com/story/12345' }]);
        }),
    },
    runtime: {
        lastError: null,
    },
};


describe('service_worker tests', () => {
    describe('getStoryId', () => {
        it('should return the correct story ID from the URL', async () => {
            // Call getStoryId and check the result
            const storyId = await getStoryId();
            expect(storyId).toBe('12345');
        });

        // Additional tests...
    });
});
