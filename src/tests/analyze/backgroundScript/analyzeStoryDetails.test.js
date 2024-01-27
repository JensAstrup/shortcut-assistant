/**
 * @jest-environment jsdom
 */

import {analyzeStoryDetails} from '../../../js/analyze/analyze'
import {sendEvent} from '../../../js/analytics/event'

jest.mock('../../../js/analytics/event', () => {
    return {
        sendEvent: jest.fn()
    };
});

describe('analyzeStoryDetails', () => {
    let originalDocumentGetElementById;
    let originalChrome;

    beforeEach(() => {
        originalDocumentGetElementById = document.getElementById;
        document.getElementById = jest.fn();

        originalChrome = global.chrome;
        global.chrome = {
            tabs: {
                query: jest.fn(),
                sendMessage: jest.fn()
            }
        };
    });

    afterEach(() => {
        document.getElementById = originalDocumentGetElementById;
        global.chrome = originalChrome;
        jest.clearAllMocks();
    });

    it('should update analyzeButton text to "Analyzing..."', async () => {
        const mockButton = { textContent: '' };
        document.getElementById.mockReturnValue(mockButton);

        await analyzeStoryDetails();

        expect(mockButton.textContent).toBe('Analyzing...');
    });

    it('should send a message to the active tab', async () => {
        document.getElementById.mockReturnValue({});
        const mockTabs = [{ id: 123 }];
        global.chrome.tabs.query.mockImplementation((queryInfo, callback) => {
            callback(mockTabs);
        });

        await analyzeStoryDetails();

        expect(global.chrome.tabs.query).toHaveBeenCalled();
        expect(global.chrome.tabs.sendMessage).toHaveBeenCalledWith(mockTabs[0].id, { message: 'analyzeStoryDescription' });
    });

    it('should call sendEvent with "analyze_story_details"', async () => {
        document.getElementById.mockReturnValue({});

        await analyzeStoryDetails();

        expect(sendEvent).toHaveBeenCalledWith('analyze_story_details');
    });
});