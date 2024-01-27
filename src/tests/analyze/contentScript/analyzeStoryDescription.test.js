/**
 * @jest-environment jsdom
 */


import {analyzeStoryDescription} from '../../../js/analyze/contentScript'


global.chrome = {
    runtime: {
        sendMessage: jest.fn(),
    },
};

describe('analyzeStoryDescription', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock any DOM methods used within extractStoryDescription and populateCommentBox
        document.querySelector = jest.fn().mockImplementation(selector => {
            if (selector === '[data-key="description"]') {
                return { textContent: 'Story Description' };
            }
            if (selector === '.textfield') {
                return { click: jest.fn(), value: '' };
            }
            if (selector === '[data-on-mouseup="App.Controller.Comment.handleOnMouseUp"]') {
                return { value: '', style: { height: '' }, scrollHeight: 100 };
            }
        });
    });

    it('should call OpenAI and populate the comment box if URL contains "story"', async () => {
        global.chrome.runtime.sendMessage.mockResolvedValue({ data: 'OpenAI Response' });

        await analyzeStoryDescription('http://example.com/story');

        expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({
            action: 'callOpenAI',
            data: { prompt: 'Story Description' },
        });
        expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({ message: 'OpenAIResponseCompleted' });
    });

    it('should send an error message if OpenAI call fails', async () => {
        global.chrome.runtime.sendMessage.mockResolvedValue({ error: 'Error Message' });

        await analyzeStoryDescription('http://example.com/story');

        expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({
            action: 'callOpenAI',
            data: { prompt: 'Story Description' },
        });
        expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({ error: 'OpenAIResponseFailed' });
    });

    it('should not proceed if URL does not contain "story"', async () => {
        await analyzeStoryDescription('http://example.com/other');

        expect(global.chrome.runtime.sendMessage).not.toHaveBeenCalled();
    });
});
