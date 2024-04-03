import * as Sentry from '@sentry/browser'

import {sendEvent} from '../analytics/event'
import {OpenAIError} from '../utils/errors'

import {fetchCompletion} from './fetch-completion'
import getCompletionFromProxy from './get-completion-from-proxy'
import getOpenAiToken from './get-openai-token'


async function callOpenAi(description: string, tabId: number) {
  const token = await getOpenAiToken()
  let messagesData
  let message

  if (!token) {
    messagesData = await getCompletionFromProxy(description)
    message = messagesData
    chrome.tabs.sendMessage(tabId, {type: 'updateOpenAiResponse', 'data': message})
    chrome.runtime.sendMessage({type: 'OpenAIResponseCompleted'})
    return message
  }
  else {
    try {
      await fetchCompletion(description, tabId)
      sendEvent('analyze_story_details', {token_provided: true}).catch(e => {
        console.error('Error sending event:', e)
        Sentry.captureException(e)
      })
    } catch (e: unknown) {
      throw new OpenAIError(`Error getting completion from OpenAI: ${e}`)
    }
  }
}

export default callOpenAi
