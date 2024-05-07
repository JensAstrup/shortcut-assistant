import * as Sentry from '@sentry/browser'

import {sendEvent} from '@sx/analytics/event'
import {getSyncedSetting} from '@sx/utils/get-synced-setting'
import sleep from '@sx/utils/sleep'

import {NotesPopup} from './notes-popup'


/**
 * Handles all interactions with the popup.html file including saving settings
 * and displaying the correct section. Functionality for saving notes and the OpenAI token are also included.
 * @class
 */
export class Popup {
  private todoistCheckbox: HTMLInputElement
  private inDevelopmentText: HTMLInputElement
  private inReviewText: HTMLInputElement
  private completedText: HTMLInputElement
  private saveButton: HTMLButtonElement
  private changelogButton: HTMLButtonElement

  constructor() {
    const todoistCheckbox = document.getElementById('todoistOptions') as HTMLInputElement
    const inDevelopmentText = document.getElementById('inDevelopmentText') as HTMLInputElement
    const inReviewText = document.getElementById('inReviewText') as HTMLInputElement
    const completedText = document.getElementById('completedText') as HTMLInputElement
    const saveButton = document.getElementById('saveKeyButton') as HTMLButtonElement

    const changelogButton = document.getElementById('changelog') as HTMLButtonElement

    if (saveButton === null || todoistCheckbox === null || changelogButton === null) {
      throw new Error('saveButton, todoistCheckbox, or changelogButton not found')
    }

    this.todoistCheckbox = todoistCheckbox
    this.inDevelopmentText = inDevelopmentText
    this.inReviewText = inReviewText
    this.completedText = completedText
    this.saveButton = saveButton
    this.changelogButton = changelogButton
    this.saveButton.addEventListener('click', this.saveButtonClicked.bind(this))

    this.changelogButton.addEventListener('click', async () => {
      await chrome.action.setBadgeText({text: ''})
    })

    sendEvent('popup_view').catch((e) => {
      console.error(e)
      Sentry.captureException(e)
    })
    this.popupLoaded().catch((e) => {
      console.error(e)
      Sentry.captureException(e)
    })
  }

  async setOpenAIToken(token: string) {
    await chrome.storage.local.set({'openAIToken': token})
  }

  async saveOptions() {
    const enableTodoistOptions = this.todoistCheckbox.checked
    await chrome.storage.sync.set({'enableTodoistOptions': enableTodoistOptions})
    await chrome.storage.sync.set({'inDevelopmentText': this.inDevelopmentText.value})
    await chrome.storage.sync.set({'inReviewText': this.inReviewText.value})
    await chrome.storage.sync.set({'completedText': this.completedText.value})
  }

  async saveButtonClicked() {
    this.saveButton.disabled = true
    const openAITokenInput = document.getElementById('openAIToken') as HTMLInputElement
    const openAIToken = openAITokenInput.value
    if (openAIToken !== '') {
      await this.setOpenAIToken(openAIToken)
    }
    await this.saveOptions()
    this.saveButton.disabled = false
    this.saveButton.textContent = 'Saved!'
    await sleep(3000)
    this.saveButton.textContent = 'Save'
  }

  setSectionDisplay(tabToShow: HTMLElement, sectionToShow: HTMLElement, tabsToHide: HTMLElement[], sectionsToHide: HTMLElement[]) {
    tabToShow.addEventListener('click', function (e) {
      e.preventDefault()
      sectionToShow.classList.remove('hidden')
      sectionsToHide.forEach(section => section.classList.add('hidden'))
      tabToShow.classList.add('tab-active')
      tabsToHide.forEach(tab => tab.classList.remove('tab-active'))
    })
  }

  /**
   * Hides the new version indicator if the Chrome badge is empty.
   */
  async handleNewVersionBadge(): Promise<void> {
    const badgeBackgroundText = await chrome.action.getBadgeText({})
    if (badgeBackgroundText === '') {
      const infoTab = document.getElementById('infoTab')
      const tabBadge = infoTab?.querySelector('.badge') as HTMLElement
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

  async updateFromSettings() {
    const todoistEnabled = await getSyncedSetting('enableTodoistOptions', false)
    if (todoistEnabled) {
      this.todoistCheckbox.setAttribute('checked', 'checked')
    }
    else if (typeof this.todoistCheckbox.removeAttribute === 'function'
      && this.todoistCheckbox.hasAttribute('checked')) {
      this.todoistCheckbox.removeAttribute('checked')
    }

    this.inDevelopmentText.value = await getSyncedSetting('inDevelopmentText', 'In Development')

    this.inReviewText.value = await getSyncedSetting('inReviewText', 'Ready for Review')

    this.completedText.value = await getSyncedSetting('completedText', 'Completed')
  }

  async popupLoaded() {
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
      Sentry.captureException(e)
    })
    const versionSpan = document.getElementById('versionInfo')
    if (versionSpan === null) {
      throw new Error('versionSpan not found')
    }
    const version = await chrome.runtime.getManifest().version
    versionSpan.textContent = `Version: ${version}`
    new NotesPopup()
    sendEvent('popup_loaded', {page_title: 'Popup', page_location: '/popup.html'}).catch((e) => {
      console.error(e)
      Sentry.captureException(e)
    })
  }
}
