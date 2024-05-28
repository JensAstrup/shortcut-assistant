import { sendEvent } from '@sx/analytics/event'
import { getSyncedSetting } from '@sx/utils/get-synced-setting'
import scope from '@sx/utils/sentry'
import sleep from '@sx/utils/sleep'

import { NotesPopup } from './notes-popup'


/**
 * Handles all interactions with the popup.html file including saving settings
 * and displaying the correct section. Functionality for saving notes and the OpenAI token are also included.
 * @class
 */
export class Popup {
  private todoistCheckbox: HTMLInputElement
  private saveButton: HTMLButtonElement
  private changelogButton: HTMLButtonElement

  constructor() {
    const todoistCheckbox = document.getElementById('todoistOptions') as HTMLInputElement | null
    const saveButton = document.getElementById('saveKeyButton') as HTMLButtonElement | null
    const changelogButton = document.getElementById('changelog') as HTMLButtonElement | null

    if (saveButton === null || todoistCheckbox === null || changelogButton === null) {
      throw new Error('saveButton, todoistCheckbox, or changelogButton not found')
    }

    this.todoistCheckbox = todoistCheckbox
    this.saveButton = saveButton
    this.changelogButton = changelogButton
    this.saveButton.addEventListener('click', this.saveButtonClicked.bind(this))

    this.changelogButton.addEventListener('click', async () => {
      await chrome.action.setBadgeText({ text: '' })
    })

    sendEvent('popup_view').catch((e) => {
      console.error(e)
      scope.captureException(e)
    })
    this.popupLoaded().catch((e) => {
      console.error(e)
      scope.captureException(e)
    })
  }

  async setOpenAIToken(token: string): Promise<void> {
    await chrome.storage.local.set({ openAIToken: token })
  }

  async saveOptions(): Promise<void> {
    const enableTodoistOptions = this.todoistCheckbox.checked
    await chrome.storage.sync.set({ enableTodoistOptions: enableTodoistOptions })
  }

  async saveButtonClicked(): Promise<void> {
    this.saveButton.disabled = true
    const openAITokenInput = document.getElementById('openAIToken') as HTMLInputElement
    const openAIToken = openAITokenInput.value
    if (openAIToken !== '') {
      await this.setOpenAIToken(openAIToken)
    }
    await this.saveOptions()
    this.saveButton.disabled = false
    this.saveButton.textContent = 'Saved!'
    const THREE_SECONDS = 3000
    await sleep(THREE_SECONDS)
    this.saveButton.textContent = 'Save'
  }

  setSectionDisplay(tabToShow: HTMLElement, sectionToShow: HTMLElement, tabsToHide: HTMLElement[], sectionsToHide: HTMLElement[]): void {
    tabToShow.addEventListener('click', function (e) {
      e.preventDefault()
      sectionToShow.classList.remove('hidden')
      sectionsToHide.forEach((section) => {
        section.classList.add('hidden')
      })
      tabToShow.classList.add('tab-active')
      tabsToHide.forEach((tab) => {
        tab.classList.remove('tab-active')
      })
    })
  }

  /**
   * Hides the new version indicator if the Chrome badge is empty.
   */
  async handleNewVersionBadge(): Promise<void> {
    const badgeBackgroundText = await chrome.action.getBadgeText({})
    if (badgeBackgroundText === '') {
      const infoTab = document.getElementById('infoTab')
      const tabBadge = infoTab?.querySelector('.badge') as HTMLElement | null
      if (!tabBadge) {
        throw new Error('tabBadge not found')
      }
      const whatsNewBadge = document.getElementById('whatsNewBadge')
      if (!whatsNewBadge) {
        throw new Error('whatsNewBadge not found')
      }
      tabBadge.style.display = 'none'
      whatsNewBadge.style.display = 'none'
    }
  }

  async updateFromSettings(): Promise<void> {
    const todoistEnabled = await getSyncedSetting('enableTodoistOptions', false)
    if (todoistEnabled) {
      this.todoistCheckbox.setAttribute('checked', 'checked')
    }
    else if (typeof this.todoistCheckbox.removeAttribute === 'function'
      && this.todoistCheckbox.hasAttribute('checked')) {
      this.todoistCheckbox.removeAttribute('checked')
    }
  }

  async popupLoaded(): Promise<void> {
    const actionsTab = document.getElementById('actionsTab')
    const settingsTab = document.getElementById('settingsTab')
    const infoTab = document.getElementById('infoTab')
    const actionsSection = document.getElementById('actionsSection')
    const settingsSection = document.getElementById('settingsSection')
    const infoSection = document.getElementById('infoSection')

    if (actionsTab === null || settingsTab === null || infoTab === null || actionsSection === null || settingsSection === null || infoSection === null) {
      throw new Error('actionsTab, settingsTab, infoTab, actionsSection, settingsSection, or infoSection not found')
    }

    await this.updateFromSettings()

    this.setSectionDisplay(actionsTab, actionsSection, [settingsTab, infoTab], [settingsSection, infoSection])
    this.setSectionDisplay(settingsTab, settingsSection, [actionsTab, infoTab], [actionsSection, infoSection])
    this.setSectionDisplay(infoTab, infoSection, [actionsTab, settingsTab], [actionsSection, settingsSection])

    this.handleNewVersionBadge().catch((e) => {
      console.error(e)
      scope.captureException(e)
    })
    const versionSpan = document.getElementById('versionInfo')
    if (versionSpan === null) {
      throw new Error('versionSpan not found')
    }
    const version = chrome.runtime.getManifest().version
    versionSpan.textContent = `Version: ${version}`
    new NotesPopup()
    sendEvent('popup_loaded', { page_title: 'Popup', page_location: '/popup.html' }).catch((e) => {
      console.error(e)
      scope.captureException(e)
    })
  }
}
