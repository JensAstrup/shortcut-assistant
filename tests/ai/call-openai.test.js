import * as Sentry from '@sentry/browser'
import {sendEvent} from '../../src/js/analytics/event'
import callOpenAI from '../../src/js/ai/call-openai'
import {fetchCompletion} from '../../src/js/ai/fetch-completion'
import getCompletionFromProxy from '../../src/js/ai/get-completion-from-proxy'
import getOpenAiToken from '../../src/js/ai/get-openai-token'


jest.mock('@sentry/browser', () => ({
  captureException: jest.fn()
}))

jest.mock('../../src/js/analytics/event', () => ({
  sendEvent: jest.fn().mockResolvedValue(undefined),
  getOrCreateClientId: jest.fn().mockResolvedValue('test-client-id')
}))

jest.mock('../../src/js/ai/fetch-completion', () => {
  return {
    fetchCompletion: jest.fn()
  }
})

jest.mock('../../src/js/ai/get-completion-from-proxy', () => jest.fn())

jest.mock('../../src/js/ai/get-openai-token', () => jest.fn())

global.chrome = {
  tabs: {
    sendMessage: jest.fn()
  },
  runtime: {
    sendMessage: jest.fn()
  }
}

describe('callOpenAI', () => {
  beforeEach(() => {
    jest.clearAllMocks()

  })

  it('should use proxy when no token is available', async () => {
    const description = 'test description'
    const tabId = 123
    const mockMessage = 'mock message from proxy'

    getOpenAiToken.mockResolvedValue(null)
    getCompletionFromProxy.mockResolvedValue(mockMessage)

    const result = await callOpenAI(description, tabId)

    expect(result).toEqual(mockMessage)
    expect(getCompletionFromProxy).toHaveBeenCalledWith(description)
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, {
      type: 'updateOpenAiResponse',
      data: mockMessage
    })
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({type: 'OpenAIResponseCompleted'})
  })

  it('should call fetchCompletion and send event when token is provided', async () => {
    const description = 'test description'
    const tabId = 123
    const token = 'test-token'

    getOpenAiToken.mockResolvedValue(token)
    fetchCompletion.mockResolvedValue('test')

    await callOpenAI(description, tabId)

    expect(fetchCompletion).toHaveBeenCalledWith(description, tabId)
    expect(sendEvent).toHaveBeenCalledWith('analyze_story_details', {token_provided: true})
  })

  it('should throw OpenAIError when fetchCompletion fails', async () => {
    const description = 'test description'
    const tabId = 123
    const token = 'test-token'
    const errorMessage = 'Test error'

    getOpenAiToken.mockResolvedValue(token)
    fetchCompletion.mockRejectedValue(new Error(errorMessage))

    await expect(callOpenAI(description, tabId)).rejects.toThrow('Error getting completion from OpenAI:')
  })

  it('should log error and capture exception when sending event fails', async () => {
    const description = 'test description'
    const tabId = 123
    const token = 'test-token'
    const errorMessage = 'Test error'
    console.error = jest.fn()

    getOpenAiToken.mockResolvedValue(token)
    fetchCompletion.mockResolvedValue('test')
    const error = new Error(errorMessage)
    sendEvent.mockRejectedValue(error)

    await callOpenAI(description, tabId)

    expect(Sentry.captureException).toHaveBeenCalledWith(error)
    expect(console.error).toHaveBeenCalledWith('Error sending event:', error)
  })
})
