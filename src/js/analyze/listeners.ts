import {AiProcessMessage, AiProcessMessageType} from '@sx/analyze/types/AiProcessMessage'

import {AiFunctions} from './ai-functions'


chrome.runtime.onMessage.addListener(handleMessages)

export default async function handleMessages(message: AiProcessMessage | Record<string, unknown>) {
  const functions = new AiFunctions()
  if(message.type === undefined) {
    return
  }
  if(message.type === AiProcessMessageType.updated || message.type === AiProcessMessageType.completed || message.type === AiProcessMessageType.failed) {
    await functions.processOpenAIResponse(<AiProcessMessage>message)
  }
}
