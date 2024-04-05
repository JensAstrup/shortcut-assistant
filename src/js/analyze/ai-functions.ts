import * as Sentry from '@sentry/browser'

import {sendEvent} from '../analytics/event'
import sleep from '../utils/sleep'


export class AiFunctions {
  private analyzeButton: HTMLButtonElement
  private analyzeText: HTMLSpanElement

  constructor() {
    const analyzeButton: HTMLButtonElement | null = <HTMLButtonElement | null>document.getElementById('analyzeButton')
    if (!analyzeButton) {
      throw new Error('Analyze button not found')
    }
    this.analyzeButton = analyzeButton
    const analyzeText = <HTMLSpanElement | null>document.getElementById('analyzeText')
    if (!analyzeText) {
      throw new Error('Analyze text not found')
    }
    this.analyzeText = analyzeText
  }

  static async triggerAnalysis() {
    const aiFunctions = new AiFunctions()
    await aiFunctions.analyzeStoryDetails()
  }

  async analyzeStoryDetails() {
    const analyzeButton = document.getElementById('analyzeButton')
    const analyzeText = document.getElementById('analyzeText')
    if (!analyzeButton || !analyzeText) {
      throw new Error('Analyze button or text not found')
    }
    analyzeText.textContent = ''
    const loadingSpan = document.createElement('span')
    loadingSpan.classList.add('loading', 'loading-spinner', 'loading-spinner-sm')
    analyzeButton.classList.add('cursor-progress')
    loadingSpan.id = 'loadingSpan'
    analyzeButton.appendChild(loadingSpan)

    chrome.tabs.query({active: true, currentWindow: true}, function (activeTabs) {
      const tabId = activeTabs[0].id
      if (!tabId) {
        throw new Error('Tab ID not found')
      }
      chrome.tabs.sendMessage(tabId, {message: 'analyzeStoryDescription'})
    })
    sendEvent('analyze_story_details').catch((e) => {
      console.error(e)
      Sentry.captureException(e)
    })
  }

  async processOpenAIResponse(message: { message: string, type: string }) {
    if (message.type === 'OpenAIResponseCompleted' || message.type === 'OpenAIResponseFailed') {

      this.analyzeText.textContent = 'Analyze Story'
      const loadingSpan = document.getElementById('loadingSpan')
      loadingSpan?.remove()
      this.analyzeButton.classList.remove('cursor-progress')
    }
    if (message.type === 'OpenAIResponseFailed') {
      const errorState = document.getElementById('errorState')
      if (errorState) {
        errorState.style.cssText = ''
        await sleep(6000)
        errorState.style.display = 'none'
      }
      sendEvent('analyze_story_details_failed').catch((e) => {
        console.error(e)
        Sentry.captureException(e)
      })
    }
  }
}
