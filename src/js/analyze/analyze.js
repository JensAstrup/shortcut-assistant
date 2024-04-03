import {AiFunctions} from './aiFunctions.js'


document.getElementById('analyzeButton').addEventListener('click', AiFunctions.analyzeStoryDetails)


chrome.runtime.onMessage.addListener(async (message) => {
    await AiFunctions.processOpenAIResponse(message)
})
