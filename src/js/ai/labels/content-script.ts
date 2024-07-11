import { AiProcessMessage } from '@sx/analyze/types/AiProcessMessage'


class LabelsContentScript {
  static async onClick(): Promise<void> {
    const isAuthenticated = await LabelsContentScript.isAuthenticated()
    if (!isAuthenticated) {
      await chrome.action.openPopup()
      return
    }
    const message: AiProcessMessage = <AiProcessMessage>{ action: 'addLabels' }
    chrome.runtime.sendMessage(message)
  }

  static async isAuthenticated(): Promise<boolean> {
    const storage = await chrome.storage.local.get('backendKey')
    return storage.backendKey !== undefined
  }

  static async addButton(): Promise<void> {
    const addLabelButton = document.querySelector('#story-dialog-add-label-dropdown')
    if (addLabelButton) {
      const labelDiv = addLabelButton.parentElement
      if (!labelDiv) {
        throw new Error('Could not find parent of add label button')
      }
      const newButton = await this.createButton()
      labelDiv.appendChild(newButton)
    }
  }

  static async createButton(): Promise<HTMLButtonElement> {
    const newButton = document.createElement('button')
    const isAuthenticated = await this.isAuthenticated()
    newButton.className = isAuthenticated ? 'add-labels action micro' : 'micro action'
    newButton.style.marginTop = '5px'
    newButton.dataset.tooltip = isAuthenticated ? 'Use AI to add relevant labels' : 'Please authenticate w/ Shortcut Assistant to use this feature'
    newButton.addEventListener('click', LabelsContentScript.onClick)
    newButton.textContent = 'Auto Add Labels...'
    return newButton
  }

  static async init(): Promise<void> {
    const featureEnabled = process.env.NEW_AI_FEATURES_ENABLED
    if (featureEnabled === 'true') {
      await this.addButton()
    }
  }
}

export default LabelsContentScript
