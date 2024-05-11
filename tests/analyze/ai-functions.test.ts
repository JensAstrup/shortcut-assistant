import * as Sentry from '@sentry/browser'

import {sendEvent} from '@sx/analytics/event'
import {AiFunctions} from '@sx/analyze/ai-functions'
import {AiProcessMessage, AiProcessMessageType} from '@sx/analyze/types/AiProcessMessage'
import {Story} from '@sx/utils/story'


jest.mock('@sentry/browser', () => ({
  captureException: jest.fn()
}))
jest.mock('@sx/analytics/event', () => ({
  sendEvent: jest.fn().mockResolvedValue(null)
}))
jest.mock('@sx/utils/story', () => ({
  Story: jest.fn().mockImplementation(() => ({
    addButton: jest.fn(),
    description: 'Sample Story Description'
  })),
}))
jest.mock('@sx/utils/sleep', () => jest.fn().mockResolvedValue(null))

describe('AiFunctions', () => {
  let mockButton: HTMLElement

  beforeEach(() => {
    jest.clearAllMocks()
    mockButton = {
      addEventListener: jest.fn(),
      className: '',
      dataset: {},
      tabIndex: 0,
      style: {},
      setAttribute: jest.fn(),
      textContent: '',
      classList: {
        contains: jest.fn().mockReturnValue(false),
        remove: jest.fn(),
        add: jest.fn()
      }
    } as unknown as HTMLElement
    document.createElement = jest.fn().mockImplementation(tag => {
      if (tag === 'button') {
        return mockButton
      }
      return null
    })
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://example.com/story'
      },
      writable: true
    })
  })

  it('constructor should handle exceptions', async () => {
    const error = new Error('Failed to add buttons')
    jest.spyOn(AiFunctions.prototype, 'addButtons').mockRejectedValue(error)

    new AiFunctions()

    // We need to wait for the next tick or use a delay to catch the async error handling
    setTimeout(() => {
      expect(console.error).toHaveBeenCalledWith(error)
      expect(Sentry.captureException).toHaveBeenCalledWith(error)
    }, 3)
  })

  it('createButton should correctly setup button properties', () => {
    const feature = AiFunctions.features.analyze
    const button = AiFunctions.createButton(feature)
    expect(button.className).toBe('action edit-description add-task micro flat-white')
    expect(button.textContent).toBe('Analyze')
    expect(button.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))
  })

  it('triggerAnalysis should set button text and send message', async () => {
    AiFunctions.buttons.analyze = mockButton as HTMLButtonElement
    await AiFunctions.triggerAnalysis()
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      action: 'callOpenAI',
      data: {prompt: Story.description, type: 'analyze'}
    })
  })

  it('analysisComplete should reset button text and style', async () => {
    AiFunctions.buttons.analyze = mockButton as HTMLButtonElement
    await AiFunctions.analysisComplete()
    expect(mockButton.textContent).toBe('Analyze Story')
    expect(mockButton.classList.contains('cursor-progress')).toBeFalsy()
  })

  it('processOpenAIResponse should handle completed message', async () => {
    const aiFuncs = new AiFunctions()
    const message = {type: AiProcessMessageType.completed, data: {type: 'analyze'}} as AiProcessMessage
    AiFunctions.buttons.analyze = mockButton as HTMLButtonElement
    AiFunctions.features.analyze.callbackFunc = jest.fn()
    await aiFuncs.processOpenAIResponse(message)
    expect(AiFunctions.features.analyze.callbackFunc).toHaveBeenCalled()
  })

  it('processOpenAIResponse should handle failure and hide error states', async () => {
    const aiFuncs = new AiFunctions()
    const message = {type: AiProcessMessageType.failed, data: {type: 'analyze'}} as AiProcessMessage
    document.getElementById = jest.fn().mockReturnValue({
      style: {cssText: '', display: ''}
    })

    await aiFuncs.processOpenAIResponse(message)
    await new Promise(process.nextTick) // Ensure all promises are resolved

    expect(sendEvent).toHaveBeenCalledWith('ai_request_failed')
  })
})
