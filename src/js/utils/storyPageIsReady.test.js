/**
 * @jest-environment jsdom
 */

import {storyPageIsReady} from "./utils";

document.querySelector = jest.fn((selector) => {
    return (selector === '.story-name') ? {} : null;
});

describe('storyPageIsReady', () => {
    it('should resolve to true when a story title can be found on the page', async () => {
        await expect(storyPageIsReady()).resolves.toBe(true);
    });

    it('should keep checking for story title until it is found', async () => {
        document.querySelector.mockReturnValueOnce(null)
            .mockReturnValueOnce(null)
            .mockReturnValueOnce({});
        const result = await storyPageIsReady();
        expect(result).toBe(true);
        expect(document.querySelector).toHaveBeenNthCalledWith(3, '.story-name');
    });
});