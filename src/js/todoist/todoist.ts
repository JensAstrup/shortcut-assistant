import {logError} from '../utils/log-error'
import {Story} from '../utils/story'


export class Todoist {
  constructor() {
    if (window.location.href.includes('story')) {
      this.setTaskButton('Work on', 'Set task to work on story').catch(logError)
      this.setTaskButton('Review', 'Set task to review story').catch(logError)
      this.setTaskButton('Follow up', 'Set task to follow up on story', 'Follow up on').catch(logError)
    }
  }

  createButton(tooltip: string, title: string) {
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

  createTooltipText(taskTitle: string | null, title: string) {
    const storyTitle = Story.title
    const storyLink = window.location.href
    if (!taskTitle) {
      return `${title} [${storyTitle}](${storyLink})`
    }
    else {
      return `${taskTitle} [${storyTitle}](${storyLink})`
    }
  }

  buttonExists() {
    return document.querySelector('button[data-todoist="true"]')
  }

  async addButtonIfNotExists(newButton: HTMLButtonElement) {
    const existingButton = this.buttonExists()
    if (!existingButton) {
      const container = await Story.getEditDescriptionButtonContainer()
      container?.appendChild(newButton)
    }
  }

  async setTaskButton(title: string, tooltip: string, taskTitle: string | null = null) {
    const newButton = this.createButton(tooltip, title)
    const buttonExists = this.buttonExists()
    taskTitle = this.createTooltipText(taskTitle, title)
    newButton.addEventListener('click', function () {
      window.open(`https://todoist.com/add?content=${taskTitle}`, '_blank')
    })
    const span = document.createElement('span')

    span.className = 'fa fa-plus'
    newButton.appendChild(span)
    newButton.append(' ' + title + '   ')

    if (buttonExists) {
      return
    }

    this.addButtonIfNotExists(newButton).catch(logError)
  }
}
