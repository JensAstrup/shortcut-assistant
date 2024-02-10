import { fetchCompletion } from './fetch_completion';
import OpenAI from 'openai'

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ text: 'mocked response' }]
        })
      }
    }
  }));
});

jest.mock('./service_worker', () => ({
    getOpenAiToken: jest.fn(),
    PROMPT: 'prompt'
}));

describe('fetchCompletion', () => {
  const openAiTokenStub = 'token';
  const descriptionStub = 'description';
  let openaiMock;
  let getOpenAiTokenMock;

  beforeEach(() => {
    openaiMock = new OpenAI({apiKey: openAiTokenStub});
    getOpenAiTokenMock = jest.fn().mockResolvedValue(openAiTokenStub);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

it('should return completion choice if successful', async () => {
  OpenAI.mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ text: 'mocked response' }]
        })
      }
    }
  }));

  require('./service_worker').getOpenAiToken.mockResolvedValue(openAiTokenStub);

  const result = await fetchCompletion(descriptionStub);
  expect(result.text).toEqual('mocked response');
});

it('should throw error if there are no completion choices', async () => {
  OpenAI.mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({ choices: [] })
      }
    }
  }));

  await expect(fetchCompletion(descriptionStub)).rejects.toThrow('No completion choices returned');
});



});