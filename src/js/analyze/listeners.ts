import {AiFunctions} from './ai-functions'


chrome.runtime.onMessage.addListener(async (message) => {
  if(message.message === 'update') {
    await AiFunctions.addAnalyzeButton()
  }
  else{
    await AiFunctions.processOpenAIResponse(message)
  }
})
