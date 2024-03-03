import {sleep} from '../utils/sleep'


export class KeyboardShortcuts {
  predefinedShortcuts = [
    {key: 's', shiftKey: true, func: this.changeState},
    {key: 'i', shiftKey: true, func: this.changeIteration},
    {key: '.', metaKey: true, func: this.copyGitBranch},
    {key: '.', metaKey: true, shiftKey: true, func: this.copyBranchAndMoveToInDevelopment}
  ]

  constructor() {
    this.shortcuts = new Map()
    this.predefinedShortcuts.forEach(shortcut => {
      this.registerShortcut(shortcut)
    })
  }

  activate() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
  }

  /**
   * Serializes an object representing a keyboard shortcut into a string representation.
   *
   * @param {object} shortcut - The shortcut to serialize
   * @param {string} shortcut.key - The alphanumeric key of the shortcut
   * @param {boolean} shortcut.metaKey - Indicates if the meta key is pressed
   * @param {boolean} shortcut.shiftKey - Indicates if the shift key is pressed
   * @param {boolean} shortcut.altKey - Indicates if the alt key is pressed
   * @param {boolean} shortcut.ctrlKey - Indicates if the ctrl key is pressed
   *
   * @returns {string} The serialized string representation of the shortcut.
   * @example {key: 'a', shiftKey: True, func: () => {} } => 'a-0-1-0-0'
   */
  serializeShortcut({key, metaKey, shiftKey, altKey, ctrlKey}) {
    return `${key.toLowerCase()}-${metaKey ? '1' : '0'}-${shiftKey ? '1' : '0'}-${altKey ? '1' : '0'}-${ctrlKey ? '1' : '0'}`
  }

  /**
   * Registers a shortcut.
   *
   * @param {Object} shortcut - The shortcut object containing the details of the shortcut.
   * @param {string} shortcut.key - The alphanumeric key of the shortcut
   * @param {boolean} shortcut.metaKey - Indicates if the meta key is pressed
   * @param {boolean} shortcut.shiftKey - Indicates if the shift key is pressed
   * @param {boolean} shortcut.altKey - Indicates if the alt key is pressed
   * @param {boolean} shortcut.ctrlKey - Indicates if the ctrl key is pressed
   * @param {Function} shortcut.func - The function to be called when the shortcut is triggered.
   * @example {key: 'a', shiftKey: True, func: () => {console.log('Shift+a was pressed')}} => null
   * @return {void}
   */
  registerShortcut(shortcut) {
    const serializedKey = this.serializeShortcut(shortcut)
    this.shortcuts.set(serializedKey, shortcut.func.bind(this))
  }

  handleKeyDown(event) {
    const serializedEventKey = this.serializeShortcut({
      key: event.key,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey
    })

    if (this.shortcuts.has(serializedEventKey)) {
      event.preventDefault()
      const func = this.shortcuts.get(serializedEventKey)
      func()
    }
  }


  async changeState() {
    const dropdown = document.getElementById('story-dialog-state-dropdown')
    if (dropdown) {
      dropdown.click()
      const dropdownPopup = document.querySelector('.dropdown')
      const input = dropdownPopup.querySelector('.autocomplete-input')
      if (input) {
        await sleep(100)
        input.value = ''
        input.focus()
      }
    }
  }

  async changeIteration() {
    const iterationSelect = document.querySelector('[data-perma-id="iteration-select"]')
    const childButton = iterationSelect.querySelector('[role="button"]')

    if (childButton) {
      childButton.click()
    }

    if (iterationSelect && childButton) {
      iterationSelect.click()
      const iterationPopup = document.querySelector('.iteration-selector')
      if (iterationPopup) {
        const input = iterationPopup.querySelector('.autocomplete-input')
        await sleep(100)
        input.value = ''
        input.focus()
      }
    }
  }

  async copyGitBranch() {
    const gitHelpers = document.getElementById('open-git-helpers-dropdown')
    gitHelpers.click()
    const branchName = document.querySelector('.git-branch').value
    await navigator.clipboard.writeText(branchName)
    gitHelpers.click()
  }

  _getStateDivWithText(text) {
    const parentDiv = document.querySelector('.list.apply-on-click')
    if (parentDiv) {
      const childDivs = parentDiv.querySelectorAll('div[data-i]')
      for (const div of childDivs) {
        if (div.innerText.trim() === text) {
          return div
        }
      }
    }
    else {
      console.error('The parent div with class "list apply-on-click" was not found.')
    }
    return null
  }

  async copyBranchAndMoveToInDevelopment() {
    await this.copyGitBranch()
    this.changeState().then(() => {
      const stateDiv = this._getStateDivWithText('In Development')
      if (stateDiv) {
        stateDiv.click()
      }
    })
  }
}
