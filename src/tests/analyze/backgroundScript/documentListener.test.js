/**
 * @jest-environment jsdom
 */

import {analyzeStoryDetails} from '../../../js/analyze/analyze'
import {sleep} from '../../../js/utils'

jest.mock('../../../js/utils', () => ({
    sleep: jest.fn().mockResolvedValue(),
}));

describe('DOMContentLoaded event listener', () => {
    let analyzeButtonMock;
    let originalDocumentGetElementById;
    let mockChrome;

    beforeEach(() => {
        analyzeButtonMock = {
            textContent: '',
            className: 'bg-purple-500 hover:bg-purple-700',
            addEventListener: jest.fn(),
        };

        originalDocumentGetElementById = document.getElementById;
        document.getElementById = jest.fn().mockReturnValue(analyzeButtonMock);

        mockChrome = {
            runtime: {
                onMessage: {
                    addListener: jest.fn(),
                },
            },
        };
        global.chrome = mockChrome;

        const event = new Event('DOMContentLoaded');
        document.dispatchEvent(event);
    });

    afterEach(() => {
        document.getElementById = originalDocumentGetElementById;
        jest.clearAllMocks();
    });

    it('should attach click event listener to analyzeButton', () => {
        expect(document.getElementById).toHaveBeenCalledWith('analyzeButton');
        expect(analyzeButtonMock.addEventListener).toHaveBeenCalledWith('click', analyzeStoryDetails);
    });

    it('should add message listener for chrome.runtime.onMessage', () => {
        expect(mockChrome.runtime.onMessage.addListener).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle OpenAIResponseCompleted message', () => {
        const messageHandler = mockChrome.runtime.onMessage.addListener.mock.calls[0][0];

        messageHandler({ message: 'OpenAIResponseCompleted' });

        expect(analyzeButtonMock.textContent).toBe('Analyze Story');
    });

    it('should handle OpenAIResponseFailed message and revert after sleep', async () => {
        const messageHandler = mockChrome.runtime.onMessage.addListener.mock.calls[0][0];

        messageHandler({ error: 'OpenAIResponseFailed' });

        expect(analyzeButtonMock.textContent).toBe('Analysis Failed');
        expect(analyzeButtonMock.className).toContain('bg-red-700');
        expect(analyzeButtonMock.className).toContain('hover:bg-red-700');

        await sleep(2000);

        expect(analyzeButtonMock.textContent).toBe('Analyze Story');
        expect(analyzeButtonMock.className).toContain('bg-purple-500');
        expect(analyzeButtonMock.className).toContain('hover:bg-purple-700');
    });
});
