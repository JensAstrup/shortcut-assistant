import {jest} from '@jest/globals'

import {AiFunctions} from '@sx/analyze/ai-functions'
import handleMessages from '@sx/analyze/listeners'


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

  it('calls addAnalyzeButton when message type is "update"', async () => {
    const message = {message: 'update', type: 'someType'}
    const addAnalyzeButton = jest.spyOn(AiFunctions, 'addAnalyzeButton').mockImplementation(() => Promise.resolve())
    const processOpenAIResponse = jest.spyOn(AiFunctions, 'processOpenAIResponse').mockImplementation(() => Promise.resolve())
    await handleMessages(message)
    expect(addAnalyzeButton).toHaveBeenCalled()
    expect(processOpenAIResponse).not.toHaveBeenCalled()
  })

  it('calls processOpenAIResponse for other message types', async () => {
    const message = {message: 'something else', type: 'otherType'}
    const addAnalyzeButton = jest.spyOn(AiFunctions, 'addAnalyzeButton')
    const processOpenAIResponse = jest.spyOn(AiFunctions, 'processOpenAIResponse')
    await handleMessages(message)
    expect(processOpenAIResponse).toHaveBeenCalledWith(message)
    expect(addAnalyzeButton).not.toHaveBeenCalled()
  })
})
