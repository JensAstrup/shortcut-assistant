import {jest} from '@jest/globals'

import {AiFunctions} from '@sx/analyze/ai-functions'
import handleMessages from '@sx/analyze/listeners'
import {AiProcessMessage} from '@sx/analyze/types/AiProcessMessage'


// Set up mock for chrome.runtime.onMessage.addListener if needed
global.chrome = {
  ...chrome,
  runtime: {
    ...chrome.runtime,
    onMessage: {
      ...chrome.runtime.onMessage,
      addListener: jest.fn()
    }
  }
}

describe('handleMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls processOpenAIResponse', async () => {
    const message = {message: 'something else', data: {type: 'analyze'}} as AiProcessMessage
    const processOpenAIResponse = jest.spyOn(AiFunctions.prototype, 'processOpenAIResponse')
    await handleMessages(message)
    expect(processOpenAIResponse).toHaveBeenCalledWith(message)
  })
})
