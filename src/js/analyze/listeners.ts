import {AiFunctions} from './ai-functions.js'


document.getElementById('analyzeButton')?.addEventListener('click', AiFunctions.triggerAnalysis)


chrome.runtime.onMessage.addListener(async (message) => {
  const aiFunctions = new AiFunctions()
  await aiFunctions.processOpenAIResponse(message)
})
