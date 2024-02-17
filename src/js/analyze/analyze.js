import {sendEvent} from '../analytics/event';
import {sleep} from 'openai/core'


async function analyzeStoryDetails(){
    let analyzeButton = document.getElementById('analyzeButton')
    let analyzeText = document.getElementById('analyzeText')
    analyzeText.textContent = '';
    let loadingSpan = document.createElement('span')
    loadingSpan.classList.add('loading', 'loading-spinner', 'loading-spinner-sm')
    loadingSpan.id = 'loadingSpan'
    analyzeButton.appendChild(loadingSpan)

    chrome.tabs.query({active: true, currentWindow: true}, function (activeTabs){
        chrome.tabs.sendMessage(activeTabs[0].id, {message: 'analyzeStoryDescription'})
    })
    sendEvent('analyze_story_details')
}

document.getElementById('analyzeButton').addEventListener('click', analyzeStoryDetails);

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.message === "OpenAIResponseCompleted" || message.message === "OpenAIResponseFailed") {
        let analyzeText = document.getElementById('analyzeText');
        analyzeText.textContent = 'Analyze Story';
        let loadingSpan = document.getElementById('loadingSpan');
        loadingSpan.remove();
    }
    if (message.message === "OpenAIResponseFailed") {
        let errorState = document.getElementById('errorState');
        // Remove all inline styling from element
        errorState.style.cssText = '';
        await sleep(6000);
        errorState.style.display = 'none';
    }
});
