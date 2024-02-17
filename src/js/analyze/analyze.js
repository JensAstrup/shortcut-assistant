import {AiFunctions} from './aiFunctions'


document.getElementById('analyzeButton').addEventListener('click', AiFunctions.analyzeStoryDetails)


chrome.runtime.onMessage.addListener(async (message) => {
    await AiFunctions.processOpenAIResponse(message)
})
