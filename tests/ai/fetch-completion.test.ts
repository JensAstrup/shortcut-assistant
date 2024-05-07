import OpenAI from 'openai'

import {fetchCompletion} from '@sx/ai/fetch-completion'
import getOpenAiToken from '@sx/ai/get-openai-token'

// Mock the required modules
jest.mock('openai')
jest.mock('@sx/ai/get-openai-token')

const mockGetOpenAiToken = getOpenAiToken as jest.MockedFunction<typeof getOpenAiToken>
const mockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>

describe('fetchCompletion', () => {
  const fakeToken = 'fake_token'
  const tabId = 123
  const description = 'Test description'

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetOpenAiToken.mockResolvedValue(fakeToken)

    const mockCreate = jest.fn().mockImplementation(() => {
      const mockStream = (async function* () {
        yield {choices: [{delta: {content: 'response from OpenAI'}}]}
      })()
      return mockStream
    })

    // @ts-expect-error Migrating to TS
    mockOpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }))
  })

  it('successfully fetches and handles data from OpenAI', async () => {
    await fetchCompletion(description, tabId)

    // Check OpenAI was initialized correctly
    expect(mockOpenAI).toHaveBeenCalledWith({apiKey: fakeToken})

    // Verify messages sent to the Chrome tab
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, {
      type: 'updateOpenAiResponse',
      data: 'response from OpenAI'
    })

    // Check final message to runtime
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({type: 'OpenAIResponseCompleted'})
  })

  // Additional tests for error scenarios...
})
