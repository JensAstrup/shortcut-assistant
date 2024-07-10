import { AiProcessMessage } from '@sx/analyze/types/AiProcessMessage'


class LabelsContentScript {
  static onClick(): void {
    const message: AiProcessMessage = <AiProcessMessage>{ action: 'addLabels' }
    chrome.runtime.sendMessage(message)
  }

  static addButton(): void {
    const addLabelButton = document.querySelector('#story-dialog-add-label-dropdown')
    if (addLabelButton) {
      const labelDiv = addLabelButton.parentElement
      if (!labelDiv) {
        throw new Error('Could not find parent of add label button')
      }
      const newButton = document.createElement('button')
      newButton.className = 'add-labels action micro flat-white'
      newButton.style.marginTop = '5px'
      newButton.addEventListener('click', this.onClick)

      const span = document.createElement('span')
      span.className = 'fa fa-plus'
      newButton.appendChild(span)

      const textNode = document.createTextNode(' Auto Add Labels...') // Added space for visual separation with icon
      newButton.appendChild(textNode)

      labelDiv.appendChild(newButton)
    }
  }

  static init(): void {
    this.addButton()
  }
}

export default LabelsContentScript
