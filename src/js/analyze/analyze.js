import {sendEvent} from '../analytics/event'
import {sleep} from '../utils'


export async function analyzeStoryDetails() {
    let analyzeButton = document.getElementById('analyzeButton')
    analyzeButton.textContent = 'Analyzing...'

    chrome.tabs.query({active: true, currentWindow: true}, function (activeTabs) {
        chrome.tabs.sendMessage(activeTabs[0].id, {message: 'analyzeStoryDescription'})
    })
    sendEvent('analyze_story_details')
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('analyzeButton').addEventListener('click', analyzeStoryDetails)

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.message === 'OpenAIResponseCompleted') {
            let analyzeButton = document.getElementById('analyzeButton')
            analyzeButton.textContent = 'Analyze Story'
        }
        else if (message.error === 'OpenAIResponseFailed') {
            let analyzeButton = document.getElementById('analyzeButton')
            analyzeButton.textContent = 'Analysis Failed'
            analyzeButton.className = analyzeButton.className.replace('bg-purple-500', 'bg-red-700').replace('hover:bg-purple-700', 'hover:bg-red-700')
            sleep(2000).then(() => {
                analyzeButton.textContent = 'Analyze Story'
                analyzeButton.className = analyzeButton.className.replace('bg-red-700', 'bg-purple-500').replace('hover:bg-red-700', 'hover:bg-purple-700')
            })
        }
    })
})
