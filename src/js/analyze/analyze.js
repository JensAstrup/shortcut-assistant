import {OpenAI} from './openAI'


document.getElementById('analyzeButton').addEventListener('click', OpenAI.analyzeStoryDetails)


chrome.runtime.onMessage.addListener(async (message) => {
    await OpenAI.processOpenAIResponse(message)
})
