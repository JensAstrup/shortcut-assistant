import {AiProcessMessage} from '@sx/analyze/types/AiProcessMessage'

import {AiFunctions} from './ai-functions'


chrome.runtime.onMessage.addListener(handleMessages)

export default async function handleMessages(message: AiProcessMessage) {
  const functions = new AiFunctions()
  await functions.processOpenAIResponse(message)
}
