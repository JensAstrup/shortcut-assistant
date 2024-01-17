import {getStoryId} from '../../js/service_worker';


global.chrome = {
    tabs: {
        query: jest.fn((queryInfo, callback) => {
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
            const storyId = await getStoryId();
            expect(storyId).toBe('12345');
        });
    });
});
