import * as Sentry from '@sentry/browser'

import {sendEvent} from '../../src/js/analytics/event'
import {AiFunctions} from '../../src/js/analyze/ai-functions'
import sleep from '../../src/js/utils/sleep'



jest.mock('../../src/js/analytics/event', () => ({
  sendEvent: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('../../src/js/utils/sleep', () => jest.fn().mockResolvedValue(undefined))

jest.mock('@sentry/browser', () => ({
  captureException: jest.fn()
}))

global.chrome = {
  tabs: {
    query: jest.fn().mockImplementation((queryInfo, callback) => {
      callback([{id: 1}])
    }),
    sendMessage: jest.fn()
  }
}

function setupDOM() {
  document.body.innerHTML = `
    <div id="analyzeButton">
    <span id="loadingSpan"></span>
    </div>
    <div id="analyzeText"></div>
    <div id="errorState"></div>
  `
}

describe('OpenAI class', () => {
  beforeEach(() => {
    setupDOM()
    jest.clearAllMocks()
  })

  describe('analyzeStoryDetails', () => {
    it('should append loading spinner and send message to active tab', async () => {
      await new AiFunctions().analyzeStoryDetails()

      const loadingSpan = document.getElementById('loadingSpan')
      expect(loadingSpan).not.toBeNull()
      expect(chrome.tabs.query).toHaveBeenCalled()
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, {message: 'analyzeStoryDescription'})
      expect(sendEvent).toHaveBeenCalledWith('analyze_story_details')
    })

    it('should catch sendEvent error and capture exception', async () => {
      const error = new Error('error')
      sendEvent.mockRejectedValue(error)
      console.error = jest.fn()
      await new AiFunctions().analyzeStoryDetails()

      expect(sendEvent).toHaveBeenCalledWith('analyze_story_details')
      expect(console.error).toHaveBeenCalledWith(error)
      expect(Sentry.captureException).toHaveBeenCalledWith(error)
    })
  })

  describe('processOpenAIResponse', () => {
    it('should handle OpenAIResponseCompleted message', async () => {
      await new AiFunctions().processOpenAIResponse({type: 'OpenAIResponseCompleted'})

      const analyzeText = document.getElementById('analyzeText')
      expect(analyzeText.textContent).toBe('Analyze Story')
      expect(document.getElementById('loadingSpan')).toBeNull()
    })

    it('should handle OpenAIResponseFailed message and hide errorState after 6 seconds', async () => {
      jest.useFakeTimers()
      await new AiFunctions().processOpenAIResponse({type: 'OpenAIResponseFailed'})

      const errorState = document.getElementById('errorState')
      expect(sleep).toHaveBeenCalledWith(6000)
      jest.advanceTimersByTime(6000)

      expect(errorState.style.display).toBe('none')
      expect(sendEvent).toHaveBeenCalledWith('analyze_story_details_failed')
    })

    it('should catch sendEvent error and capture exception', async () => {
      const error = new Error('error')
      sendEvent.mockRejectedValue(error)
      console.error = jest.fn()
      await new AiFunctions().processOpenAIResponse({type: 'OpenAIResponseFailed'})

      expect(sendEvent).toHaveBeenCalledWith('analyze_story_details_failed')
      expect(console.error).toHaveBeenCalledWith(error)
      expect(Sentry.captureException).toHaveBeenCalledWith(error)
    })
  })
})
