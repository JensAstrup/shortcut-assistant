import * as Sentry from '@sentry/browser'

import {sendEvent} from '@sx/analytics/event'
import {
  handleGetOpenAiToken,
  handleGetSavedNotes,
  handleOpenAICall
} from '@sx/service-worker/handlers'


type Request = {
  action?: string,
  data?: { eventName?: string, params?: Record<string, string>, prompt: string },
  message?: string,
}

function registerAiListeners() {
  chrome.runtime.onMessage.addListener((request: Request, sender: chrome.runtime.MessageSender, sendResponse: (response: unknown) => void) => {
    if (request.action === 'callOpenAI' && request.data) {
      if (!sender.tab || !sender.tab.id) {
        return
      }
      handleOpenAICall(request.data.prompt, sender.tab.id).then(sendResponse)
      return true // Keep the message channel open for the async response
    }

    if (request.message === 'getOpenAiToken') {
      handleGetOpenAiToken().then(sendResponse)
      return true
    }
  })
}

function registerNotesListeners() {
  chrome.runtime.onMessage.addListener((request: Request, sender: chrome.runtime.MessageSender, sendResponse: (response: unknown) => void) => {
    if (request.action === 'getSavedNotes') {
      handleGetSavedNotes().then(sendResponse)
      return true
    }
  })
}

function registerAnalyticsListeners() {
  chrome.runtime.onMessage.addListener((request: Request) => {
    if (request.action === 'sendEvent') {
      if (!request.data || !request.data.eventName) return true
      sendEvent(request.data.eventName, request.data.params).catch(e => {
        console.error('Error sending event:', e)
        Sentry.captureException(e)
      })
    }
  })
}

function registerListeners() {
  registerAiListeners()
  registerAnalyticsListeners()
  registerNotesListeners()
}

export {registerAiListeners, registerAnalyticsListeners, registerNotesListeners}
export default registerListeners

registerListeners()
