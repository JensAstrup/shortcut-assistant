/**
 * @jest-environment jsdom
 */
import * as eventModule from '../analytics/event';
import * as utilsModule from '../utils/utils';
import {OpenAI} from './openAI'

// Mocking the imported modules
jest.mock('../analytics/event', () => ({
  sendEvent: jest.fn(),
}));

jest.mock('../utils/utils', () => ({
  sleep: jest.fn().mockResolvedValue(undefined),
}));

// Mocking the Chrome API
const mockSendMessage = jest.fn();
global.chrome = {
  tabs: {
    query: jest.fn().mockImplementation((queryInfo, callback) => {
      callback([{ id: 1 }]);
    }),
    sendMessage: mockSendMessage,
  },
};

// Mocking DOM elements
function setupDOM() {
  document.body.innerHTML = `
    <div id="analyzeButton">
    <span id="loadingSpan"></span>
    </div>
    <div id="analyzeText"></div>
    <div id="errorState"></div>
  `;
}

describe('OpenAI class', () => {
  beforeEach(() => {
    setupDOM(); // Setup DOM before each test
    jest.clearAllMocks(); // Clear mocks
  });

  describe('analyzeStoryDetails', () => {
    it('should append loading spinner and send message to active tab', async () => {
      await OpenAI.analyzeStoryDetails();

      const loadingSpan = document.getElementById('loadingSpan');
      expect(loadingSpan).not.toBeNull();
      expect(chrome.tabs.query).toHaveBeenCalled();
      expect(mockSendMessage).toHaveBeenCalledWith(1, {message: 'analyzeStoryDescription'});
      expect(eventModule.sendEvent).toHaveBeenCalledWith('analyze_story_details');
    });
  });

  describe('processOpenAIResponse', () => {
    it('should handle OpenAIResponseCompleted message', async () => {
      await OpenAI.processOpenAIResponse({ message: 'OpenAIResponseCompleted' });

      const analyzeText = document.getElementById('analyzeText');
      expect(analyzeText.textContent).toBe('Analyze Story');
      expect(document.getElementById('loadingSpan')).toBeNull();
    });

    it('should handle OpenAIResponseFailed message and hide errorState after 6 seconds', async () => {
      jest.useFakeTimers();
      await OpenAI.processOpenAIResponse({ message: 'OpenAIResponseFailed' });

      const errorState = document.getElementById('errorState');
      expect(utilsModule.sleep).toHaveBeenCalledWith(6000);
      jest.advanceTimersByTime(6000);

      expect(errorState.style.display).toBe('none');
      expect(eventModule.sendEvent).toHaveBeenCalledWith('analyze_story_details_failed');
    });
  });
});
