import {sleep} from 'openai/core'
import {KeyboardHandler} from './keyboardHandler'


export class Shortcuts extends KeyboardHandler {
  predefinedShortcuts = [
    {key: 's', shiftKey: true, func: this.changeStatus},
    {key: 'i', shiftKey: true, func: this.changeIteration},
    {key: '.', metaKey: true, func: this.copyGitBranch}
  ]

  constructor() {
    super()
    this.predefinedShortcuts.forEach(shortcut => {
      this.registerShortcut(shortcut)
    })
  }

  async changeStatus() {
    const dropdown = document.getElementById('story-dialog-state-dropdown')
    if (dropdown) {
      dropdown.click()
      const dropdownPopup = document.querySelector('.dropdown')
      const input = dropdownPopup.querySelector('.autocomplete-input')
      await sleep(100)
      input.value = ''
      input.focus()
    }
  }

  async changeIteration() {
    const iterationSelect = document.querySelector('[data-perma-id="iteration-select"]')
    const childButton = iterationSelect.querySelector('[role="button"]')
    if (childButton) {
      childButton.click()
    }

    if (iterationSelect) {
      iterationSelect.click()
      const iterationPopup = document.querySelector('.iteration-selector')
      const input = iterationPopup.querySelector('.autocomplete-input')
      await sleep(100)
      input.value = ''
      input.focus()
    }
  }

  async copyGitBranch() {
    const gitHelpers = document.getElementById('open-git-helpers-dropdown')
    gitHelpers.click()
    const branchName = document.querySelector('.git-branch').value
    await navigator.clipboard.writeText(branchName)
    gitHelpers.click()
  }
}