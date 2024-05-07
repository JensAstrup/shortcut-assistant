import * as Sentry from '@sentry/browser'

import {sendEvent} from '@sx/analytics/event'
import sleep from '@sx/utils/sleep'
import {Story} from '@sx/utils/story'


export class AiFunctions {
  static analyzeButton: HTMLButtonElement

  static createButton(): HTMLButtonElement {
    const newButton = document.createElement('button')
    newButton.className = 'action edit-description add-task micro flat-white'
    newButton.dataset.tabindex = ''
    newButton.dataset.tooltip = 'Analyse Story Details'
    newButton.dataset.key = 'Analyze'
    newButton.tabIndex = 2
    newButton.style.marginTop = '10px'
    newButton.setAttribute('data-analyze', 'true')
    return newButton
  }

  static buttonExists() {
    return document.querySelector('button[data-todoist="true"]')
  }

  static async addButtonIfNotExists(newButton: HTMLButtonElement) {
    const existingButton = AiFunctions.buttonExists()
    if (!existingButton) {
      const container = await Story.getEditDescriptionButtonContainer()
      container?.appendChild(newButton)
    }
  }

  static async addAnalyzeButton() {
    const newButton = AiFunctions.createButton()
    AiFunctions.analyzeButton = newButton
    newButton.addEventListener('click', async function () {
      await AiFunctions.triggerAnalysis()
    })
    newButton.textContent = 'Analyze Story'
    if (AiFunctions.buttonExists()) {
      return
    }
    await AiFunctions.addButtonIfNotExists(newButton)
  }

  static async triggerAnalysis() {
    await AiFunctions.analyzeStoryDescription(window.location.href)
  }

  static async analyzeStoryDescription(activeTabUrl: string) {
    if (activeTabUrl.includes('story')) {
      const description = Story.description
      AiFunctions.analyzeButton.textContent = 'Analyzing...'
      await chrome.runtime.sendMessage({
        action: 'callOpenAI',
        data: {prompt: description}
      })
    }
  }

  static async complete(){
    AiFunctions.analyzeButton.textContent = 'Analyze Story'
  }

  static async processOpenAIResponse(message: { message?: string, type: string }) {
    if (message.type === 'OpenAIResponseCompleted' || message.type === 'OpenAIResponseFailed') {

      AiFunctions.analyzeButton.textContent = 'Analyze Story'
      const loadingSpan = document.getElementById('loadingSpan')
      loadingSpan?.remove()
      this.analyzeButton.classList.remove('cursor-progress')
    }
    if (message.type === 'OpenAIResponseFailed') {
      const errorState = document.getElementById('errorState')
      if (errorState) {
        errorState.style.cssText = ''
        const SIX_SECONDS = 6000
        await sleep(SIX_SECONDS)
        errorState.style.display = 'none'
      }
      sendEvent('analyze_story_details_failed').catch((e) => {
        console.error(e)
        Sentry.captureException(e)
      })
    }
  }
}
