import storyPageIsReady from './storyPageIsReady'


jest.mock('./sleep', () => jest.fn().mockResolvedValue(undefined))

document.querySelector = jest.fn((selector) => {
    return (selector === '.story-name') ? {} : null;
});

describe('storyPageIsReady', () => {
    it('should resolve to true when a story title can be found on the page', async () => {
        await expect(storyPageIsReady()).resolves.toBe(true);
    });

    it('should keep checking for story title until it is found', async () => {
        document.querySelector.mockReturnValue(null)
        const result = await storyPageIsReady();
        expect(result).toBe(false)
        expect(document.querySelector).toHaveBeenNthCalledWith(9, '.story-name')
    });
});
