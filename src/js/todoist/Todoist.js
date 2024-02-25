import {Story} from '../utils/story'
import {getDescriptionButtonContainer, logError} from '../utils/utils'


export class Todoist {
  constructor() {
    if (window.location.href.includes('story')) {
      this.setTaskButton('Work on', 'Set task to work on story').catch(logError)
      this.setTaskButton('Review', 'Set task to review story').catch(logError)
      this.setTaskButton('Follow up', 'Set task to follow up on story', 'Follow up on').catch(logError)
    }
  }

  createButton(tooltip, title) {
    const newButton = document.createElement('button')
    newButton.className = 'action edit-description add-task micro flat-white'
    newButton.dataset.tabindex = ''
    newButton.dataset.tooltip = tooltip
    newButton.dataset.key = title
    newButton.tabIndex = 2
    return newButton
  }

  createTooltipText(taskTitle, title) {
    const storyTitle = Story.title
    const storyLink = window.location.href
    if (taskTitle === undefined) {
      return `${title} [${storyTitle}](${storyLink})`
    }
    else {
      return `${taskTitle} [${storyTitle}](${storyLink})`
    }
  }

  buttonExists(title) {
    return document.querySelector(`[data-key="${title}]"`)
  }

  async addButtonIfNotExists(title, newButton) {
    const container = await getDescriptionButtonContainer()
    const existingButton = this.buttonExists(title)
    if (!existingButton) {
      container.appendChild(newButton)
    }
  }

  async setTaskButton(title, tooltip, taskTitle) {
    const newButton = this.createButton(tooltip, title)
    const buttonExists = this.buttonExists(title)
    if (buttonExists) {
      Ï
      return
    }
    taskTitle = this.createTooltipText(taskTitle, title)
    newButton.addEventListener('click', function () {
      window.open(`https://todoist.com/add?content=${taskTitle}`, '_blank')
    })

    const span = document.createElement('span')
    span.className = 'fa fa-plus'
    newButton.appendChild(span)
    newButton.append(' ' + title + '   ')

    this.addButtonIfNotExists(title, newButton).catch(logError)
  }
}
