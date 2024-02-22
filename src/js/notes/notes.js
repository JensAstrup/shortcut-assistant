import {getDescriptionButtonContainer, logError} from '../utils/utils'


export class Notes {
  constructor() {
    if (window.location.href.includes('story')) {
      this.setContentIfDataExists().catch(logError)
    }
  }

  async setContentExistsNotice() {
    const newButton = document.createElement('button')
    newButton.className = 'action edit-description view-notes micro flat-white'
    newButton.dataset.tabindex = ''
    newButton.dataset.tooltip = 'This story has private notes set'
    newButton.tabIndex = 2

    const span = document.createElement('span')
    span.className = 'fa fa-pencil'
    newButton.appendChild(span)

    newButton.append(' Has Notes')

    let container = await getDescriptionButtonContainer()
    // Check if the button already exists in the container
    const existingButton = container.querySelector('.action.edit-description.view-notes.micro.flat-white')
    if (!existingButton) {
      container.appendChild(newButton)
    }
  }

  remove() {
    const element = document.querySelector('.view-notes')
    if (element !== null) {
      element.remove()
    }
  }

  async setContentIfDataExists(data) {
    if (data === undefined) {
      const response = await chrome.runtime.sendMessage({action: 'getSavedNotes'})
      data = response.data
    }
    if (!data) {
      this.remove()
    }
    else {
      this.setContentExistsNotice().catch(logError)
    }
  }

}