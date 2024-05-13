import {AiProcessMessage, AiProcessMessageType} from '@sx/analyze/types/AiProcessMessage'

import {AiFunctions} from './ai-functions'


chrome.runtime.onMessage.addListener(handleMessages)

export default async function handleMessages(message: AiProcessMessage) {
  const functions = new AiFunctions()
  if(message.type === AiProcessMessageType.updated || message.type === AiProcessMessageType.completed || message.type === AiProcessMessageType.failed) {
    await functions.processOpenAIResponse(message)
  }
  else if (message.message === 'update'){
  }
}
