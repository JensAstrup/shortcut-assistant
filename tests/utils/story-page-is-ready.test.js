import storyPageIsReady from '../../src/js/utils/story-page-is-ready'


jest.mock('../../src/js/utils/sleep', () => jest.fn().mockResolvedValue(undefined))

document.querySelector = jest.fn((selector) => {
    return (selector === '.story-name') ? {} : null;
});

describe('storyPageIsReady', () => {
    beforeEach(() => {
        document.querySelector.mockClear()
    })

    it('should resolve to true when a story title can be found on the page', async () => {
        await expect(storyPageIsReady()).resolves.toBe(true);
    });

    it('should keep checking for story title until it is found', async () => {
        document.querySelector.mockReturnValue(null)
        const result = await storyPageIsReady();
        expect(result).toBe(false)
        expect(document.querySelector).toHaveBeenNthCalledWith(10, '.story-name')
        // 10 calls to document.querySelector, plus the initial call
        expect(document.querySelector).toHaveBeenCalledTimes(11)
    });
});
