import { AiProcessMessage, AiProcessMessageType } from '@sx/analyze/types/AiProcessMessage'

import { logError } from '../utils/log-error'


export class AdditionalContent {
  static async populate(text?: string): Promise<void> {
    if (text === undefined) {
      return
    }

    const taskSection = this.getSection()
    taskSection.innerText = taskSection.innerText + text
  }

  static duplicateTasks() {
    const taskSection = document.querySelector('[data-type="task"]')
    if (!taskSection) {
      throw new Error('Could not find task section')
    }
    const clone = taskSection.cloneNode(true)
    const parent = taskSection.parentNode
    if (!parent) {
      throw new Error('Could not find parent of task section')
    }
    return parent.insertBefore(clone, taskSection)
  }

  static refactorSection(section: HTMLElement) {
    const header = section.querySelector('.section-head') as HTMLElement
    header.innerText = 'AI Response'
    section = section.querySelector('.tasks') as HTMLElement
    section.innerHTML = ''
    section.setAttribute('data-type', 'ai-response')
    section.className = 'markdown-formatted'
    return section
  }

  static getSection() {
    const section = document.querySelector('[data-type="ai-response"]')
    if (!section) {
      const duplicate = this.duplicateTasks()
      return this.refactorSection(duplicate as HTMLElement)
    }
    return section as HTMLElement
  }
}


chrome.runtime.onMessage.addListener((request: AiProcessMessage) => {
  if (request.status === AiProcessMessageType.updated && request.data) {
    AdditionalContent.populate(request.data.content).catch(logError)
  }
})
