import {sendEvent} from '../analytics/event'
import {sleep} from '../utils/utils'
import * as Sentry from '@sentry/browser'

export class AiFunctions{
    constructor(){
    }

    static async analyzeStoryDetails(){
        let analyzeButton = document.getElementById('analyzeButton')
        let analyzeText = document.getElementById('analyzeText')
        analyzeText.textContent = ''
        let loadingSpan = document.createElement('span')
        loadingSpan.classList.add('loading', 'loading-spinner', 'loading-spinner-sm')
        analyzeButton.classList.add('cursor-progress')
        loadingSpan.id = 'loadingSpan'
        analyzeButton.appendChild(loadingSpan)

        chrome.tabs.query({active: true, currentWindow: true}, function (activeTabs){
            chrome.tabs.sendMessage(activeTabs[0].id, {message: 'analyzeStoryDescription'})
        })
        sendEvent('analyze_story_details').catch((e) => {
            console.error(e)
            Sentry.captureException(e)
        })
    }

    static async processOpenAIResponse(message){
        if (message.type === 'OpenAIResponseCompleted' || message.type === 'OpenAIResponseFailed') {
            let analyzeButton = document.getElementById('analyzeButton')
            let analyzeText = document.getElementById('analyzeText')
            analyzeText.textContent = 'Analyze Story'
            let loadingSpan = document.getElementById('loadingSpan')
            loadingSpan.remove()
            analyzeButton.classList.remove('cursor-progress')
        }
        if (message.type === 'OpenAIResponseFailed') {
            let errorState = document.getElementById('errorState')
            errorState.style.cssText = ''
            await sleep(6000)
            errorState.style.display = 'none'
            sendEvent('analyze_story_details_failed').catch((e) => {
                console.error(e)
                Sentry.captureException(e)
            })
        }
    }
}
