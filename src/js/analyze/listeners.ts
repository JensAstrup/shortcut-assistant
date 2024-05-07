import {AiFunctions} from './ai-functions'


chrome.runtime.onMessage.addListener(async (message) => {
  await AiFunctions.processOpenAIResponse(message)
})
