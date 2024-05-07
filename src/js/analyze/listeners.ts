import {AiFunctions} from './ai-functions'


chrome.runtime.onMessage.addListener(handleMessages)

export default async function handleMessages(message: { message?: string, type?: string }) {
  if (message.message === 'update') {
    await AiFunctions.addAnalyzeButton()
  }
  else {
    await AiFunctions.processOpenAIResponse(message)
  }
}
