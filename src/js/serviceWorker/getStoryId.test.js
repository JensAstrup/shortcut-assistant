import {getStoryId} from './utils';

beforeAll(() => {
    global.chrome = {
        tabs: {
            query: jest.fn((queryInfo, callback) => {
                callback([{ url: 'http://example.com/story/12345' }]);
            }),
        },
        runtime: {
            lastError: null,
            onInstalled: {
                addListener: jest.fn(),
            },
        },
    };
});

describe('service_worker tests', () => {
    describe('getStoryId', () => {
        it('should return the correct story ID from the URL', async () => {
            const storyId = await getStoryId();
            expect(storyId).toBe('12345');
        });
    });
});
