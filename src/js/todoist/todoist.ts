import {sleep} from 'openai/core'

import {logError} from '@sx/utils/log-error'
import {Story} from '@sx/utils/story'


export class Todoist {
  static createButton(tooltip: string, title: string) {
    const newButton = document.createElement('button')
    newButton.className = 'action edit-description add-task micro flat-white'
    newButton.dataset.tabindex = ''
    newButton.dataset.tooltip = tooltip
    newButton.dataset.key = title
    newButton.tabIndex = 2
    newButton.style.marginTop = '10px'
    newButton.setAttribute('data-todoist', 'true')
    return newButton
  }

  static createTooltipText(taskTitle: string | null, title: string) {
    const storyTitle = Story.title
    const storyLink = window.location.href
    if (!taskTitle) {
      return `${title} [${storyTitle}](${storyLink})`
    } else {
      return `${taskTitle} [${storyTitle}](${storyLink})`
    }
  }

  static buttonExists() {
    return document.querySelector('button[data-todoist="true"]')
  }

  static async addButtonIfNotExists(newButton: HTMLButtonElement) {
    const existingButton = Todoist.buttonExists()
    if (!existingButton) {
      const container = await Story.getEditDescriptionButtonContainer()
      container?.appendChild(newButton)
    }
  }

  static async setTaskButton(title: string, tooltip: string, taskTitle: string | null = null) {
    const newButton = Todoist.createButton(tooltip, title)
    taskTitle = Todoist.createTooltipText(taskTitle, title)
    newButton.addEventListener('click', function () {
      window.open(`https://todoist.com/add?content=${taskTitle}`, '_blank')
    })
    const span = document.createElement('span')

    span.className = 'fa fa-plus'
    newButton.appendChild(span)
    newButton.append(' ' + title + '   ')

    if (Todoist.buttonExists()) {
      return
    }

    Todoist.addButtonIfNotExists(newButton).catch(logError)
  }

  static async setTaskButtons() {
    if (Todoist.buttonExists()) return
    Todoist.setTaskButton('Work on', 'Set task to work on story').catch(logError)
    Todoist.setTaskButton('Review', 'Set task to review story').catch(logError)
    Todoist.setTaskButton('Follow up', 'Set task to follow up on story', 'Follow up on').catch(logError)
  }
}
