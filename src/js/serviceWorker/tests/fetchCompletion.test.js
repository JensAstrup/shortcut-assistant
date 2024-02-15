import { fetchCompletion } from '../fetch_completion';
import {getOpenAiToken} from '../service_worker'
import OpenAI from 'openai'

jest.mock('../service_worker', () => ({
    getOpenAiToken: jest.fn(),
    PROMPT: 'prompt'
}));

jest.mock('chrome', () => ({
  tabs: {
    sendMessage: jest.fn()
  },
  runtime: {
    sendMessage: jest.fn()
  }
}), {virtual: true});

global.chrome = {
  tabs: {
    sendMessage: jest.fn()
  },
  runtime: {
    sendMessage: jest.fn()
  }
}

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn(),
          on: jest.fn()
        }
      }
    };
  });
});

jest.mock('../service_worker', () => ({ getOpenAiToken: jest.fn() }));

getOpenAiToken.mockResolvedValue('token');

describe('fetchCompletion function', () => {
beforeEach(() => {
  const asyncIterable = {
    async *[Symbol.asyncIterator]() {
      yield { choices: [{ delta: { content: "response 1" } }] };
      yield { choices: [{ delta: { content: "response 2" } }] };
    }
  };

  // Assuming OpenAI is imported as `OpenAI` in your test file
  OpenAI.mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue(asyncIterable)
        }
      }
    };
  });
});
  it('fetches completion with correct message', async () => {
    const tabId = 1;
    const description = 'description';

    await fetchCompletion(description, tabId);

    expect(OpenAI).toHaveBeenCalledWith({ apiKey: 'token' });
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, {
      message: 'updateOpenAiResponse',
      data: 'response 1',
    });
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, {
      message: 'updateOpenAiResponse',
      data: 'response 2',
    });
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      message: 'OpenAIResponseCompleted',
    });
  });
});
