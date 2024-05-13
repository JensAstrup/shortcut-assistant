import _ from 'lodash'

import {logError} from '@sx/utils/log-error'
import sleep from '@sx/utils/sleep'
import {Story} from '@sx/utils/story'


export class Todoist {
  static tasks = {
    'Work on': 'Set task to work on story',
    'Review': 'Set task to review story',
    'Follow up': 'Set task to follow up on story'
  }

  static createButton(tooltip: string, title: string) {
    const newButton = document.createElement('button')
    newButton.className = 'action edit-description add-task micro flat-white'
    newButton.dataset.tabindex = ''
    newButton.dataset.tooltip = tooltip
    newButton.dataset.key = title
    newButton.tabIndex = 2
    newButton.style.marginTop = '10px'
    newButton.setAttribute('data-todoist', 'true')
    const titleAttribute = `data-${_.kebabCase(title)}`
    newButton.setAttribute(titleAttribute, 'true')
    return newButton
  }

  static createTooltipText(taskTitle: string | null, title: string) {
    const storyTitle = Story.title
    const storyLink = window.location.href
    if (!taskTitle) {
      return `${title} [${storyTitle}](${storyLink})`
    }
    else {
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
    const TWO_SECONDS = 2000
    sleep(TWO_SECONDS).then(() => {
      // Iterate through all buttons with data-x="true" where x is the key in Todoist.tasks
      for(const key of Object.keys(Todoist.tasks)) {
        const existingButtons = document.querySelectorAll(`button[data-${_.kebabCase(key)}="true"]`)
        if (existingButtons.length > 1) {
          existingButtons[0].remove()
        }
      }
    })
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
    const story = new Story()
    await story.addButton(newButton, _.kebabCase(title))
    // Todoist.addButtonIfNotExists(newButton).catch(logError)
  }

  static async setTaskButtons() {
    if (Todoist.buttonExists()) return
    for (const [tooltip, title] of Object.entries(Todoist.tasks)) {
      await Todoist.setTaskButton(tooltip, title)
    }
  }
}
