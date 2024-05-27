import { sendEvent } from '@sx/analytics/event'
import { AiPromptType } from '@sx/analyze/types/ai-prompt-type'
import {
  handleGetSavedNotes,
  handleOpenAICall
} from '@sx/service-worker/handlers'
import scope from '@sx/utils/sentry'


type Request = {
  action?: string
  data?: { eventName?: string, params?: Record<string, string>, prompt: string, type: AiPromptType }
  message?: string
}

function registerAiListeners(): void {
  chrome.runtime.onMessage.addListener((request: Request, sender: chrome.runtime.MessageSender, sendResponse: (response: unknown) => void) => {
    if (request.action === 'callOpenAI' && request.data) {
      if (!sender.tab || !sender.tab.id) {
        return
      }
      handleOpenAICall(request.data.prompt, request.data.type, sender.tab.id).then(sendResponse)
      return true // Keep the message channel open for the async response
    }
  })
}

function registerNotesListeners(): void {
  chrome.runtime.onMessage.addListener((request: Request, sender: chrome.runtime.MessageSender, sendResponse: (response: unknown) => void) => {
    if (request.action === 'getSavedNotes') {
      handleGetSavedNotes().then(sendResponse)
      return true
    }
  })
}

function registerAnalyticsListeners(): void {
  chrome.runtime.onMessage.addListener((request: Request) => {
    if (request.action === 'sendEvent') {
      if (!request.data || !request.data.eventName) return true
      sendEvent(request.data.eventName, request.data.params).catch((e) => {
        console.error('Error sending event:', e)
        scope.captureException(e)
      })
    }
  })
}

function registerListeners(): void {
  registerAiListeners()
  registerAnalyticsListeners()
  registerNotesListeners()
}

export { registerAiListeners, registerAnalyticsListeners, registerNotesListeners }
registerListeners()
