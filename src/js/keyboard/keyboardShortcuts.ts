import sleep from '../utils/sleep'


type shortcut = ({
  altKey?: boolean
  ctrlKey?: boolean
  func: () => Promise<void>
  key: string
  metaKey?: boolean
  shiftKey: boolean
})

export class KeyboardShortcuts {
  predefinedShortcuts: shortcut[] = [
    {key: 's', shiftKey: true, ctrlKey: true, func: this.changeState},
    {key: 'i', shiftKey: true, ctrlKey: true, func: this.changeIteration},
    {key: 'g', shiftKey: true, ctrlKey: true, func: this.copyGitBranch},
    {key: '.', metaKey: true, shiftKey: true, func: this.copyBranchAndMoveToInDevelopment}
  ]

  shortcuts: Map<string, () => Promise<void>>

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
  serializeShortcut({key, metaKey, shiftKey, altKey, ctrlKey}: {
    altKey?: boolean,
    ctrlKey?: boolean,
    key: string,
    metaKey?: boolean,
    shiftKey: boolean
  }) {
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
  registerShortcut(shortcut: shortcut) {
    const serializedKey = this.serializeShortcut(shortcut)
    this.shortcuts.set(serializedKey, shortcut.func.bind(this))
  }

  handleKeyDown(event: KeyboardEvent) {
    const serializedEventKey = this.serializeShortcut({
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      key: event.key,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey
    })

    if (this.shortcuts.has(serializedEventKey)) {
      event.preventDefault()
      const func: (() => Promise<void>) | undefined = this.shortcuts.get(serializedEventKey)
      if (func) {
        func().catch(console.error)
      }
    }
  }


  async changeState() {
    const dropdown = document.getElementById('story-dialog-state-dropdown')
    if (dropdown) {
      dropdown.click()
      const dropdownPopup = document.querySelector('.dropdown')
      if (!dropdownPopup) {
        console.error('The dropdown popup was not found.')
        return
      }
      const input: HTMLInputElement | null = dropdownPopup.querySelector('.autocomplete-input')
      if (input) {
        await sleep(100)
        input.value = ''
        input.focus()
      }
    }
  }

  async changeIteration() {
    const iterationSelect: HTMLInputElement | null = document.querySelector('[data-perma-id="iteration-select"]')
    const childButton: HTMLButtonElement | null | undefined = iterationSelect?.querySelector('[role="button"]')

    if (childButton) {
      childButton.click()
    }

    if (iterationSelect && childButton) {
      iterationSelect.click()
      const iterationPopup = document.querySelector('.iteration-selector')
      if (iterationPopup) {
        const input: HTMLInputElement | null = iterationPopup.querySelector('.autocomplete-input')
        if (!input) {
          console.error('The iteration input field was not found.')
          return
        }
        await sleep(100)
        input.value = ''
        input.focus()
      }
    }
  }

  async copyGitBranch() {
    const gitHelpers = document.getElementById('open-git-helpers-dropdown')
    if (!gitHelpers) {
      console.error('The git helpers dropdown was not found.')
      return
    }
    gitHelpers.click()
    const gitBranchInput: HTMLInputElement | null = document.querySelector('.git-branch')
    if (!gitBranchInput) {
      console.error('The git branch input was not found.')
      return
    }
    const branchName = gitBranchInput.value
    await navigator.clipboard.writeText(branchName)
    gitHelpers.click()
  }

  _getStateDivWithText(text: string) {
    const parentDiv = document.querySelector('.list.apply-on-click')
    if (parentDiv) {
      const childDivs: Iterable<HTMLElement> = parentDiv.querySelectorAll('div[data-i]') as unknown as Iterable<HTMLElement>
      for (const div of childDivs) {
        if (div.innerText.trim() === text) {
          return div
        }
      }
    } else {
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
