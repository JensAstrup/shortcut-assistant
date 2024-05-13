import * as Sentry from '@sentry/browser'

import {sendEvent} from '@sx/analytics/event'
import {AiPromptType} from '@sx/analyze/types/ai-prompt-type'
import {OpenAIError} from '@sx/utils/errors'

import {fetchCompletion} from './fetch-completion'
import getCompletionFromProxy from './get-completion-from-proxy'
import getOpenAiToken from './get-openai-token'


async function callOpenAi(description: string, type: AiPromptType, tabId: number) {
  const token = await getOpenAiToken()

  const useProxy = !token
  sendEvent('ai', {token_provided: !useProxy, type}).catch(e => {
    console.error('Error sending event:', e)
    Sentry.captureException(e)
  })

  if (useProxy) {
    await getCompletionFromProxy(description, type, tabId)
  }
  else {
    try {
      await fetchCompletion(description, type, tabId)
    }
    catch (e: unknown) {
      throw new OpenAIError(`Error getting completion from OpenAI: ${e}`)
    }
  }
}

export default callOpenAi
