import { fetchCompletion } from './fetch_completion';
import OpenAI from 'openai'; // assuming you have installed `openai` library

jest.mock('openai', () => {
  // Mock the default export to be a function
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

  // Inside your describe block
it('should return completion choice if successful', async () => {
  // Setup the mock to return a specific value
  OpenAI.mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ text: 'mocked response' }]
        })
      }
    }
  }));

  // Assuming getOpenAiToken is used within fetchCompletion and needs a resolved value
  require('./service_worker').getOpenAiToken.mockResolvedValue(openAiTokenStub);

  const result = await fetchCompletion(descriptionStub);
  expect(result.text).toEqual('mocked response'); // Adjust according to the expected format
});

it('should throw error if there are no completion choices', async () => {
  // Adjust the mock for this test case
  OpenAI.mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({ choices: [] }) // Simulate no choices
      }
    }
  }));

  await expect(fetchCompletion(descriptionStub)).rejects.toThrow('No completion choices returned');
});



});