import * as Sentry from '@sentry/browser'
import {sendEvent} from '../analytics/event'
import {getSyncedSetting} from '../utils/getSyncedSetting'
import sleep from '../utils/sleep'
import {NotesPopup} from './notesPopup'


/**
 * Handles all interactions with the popup.html file including saving settings
 * and displaying the correct section. Functionality for saving notes and the OpenAI token are also included.
 * @class
 */
export class Popup {
  constructor() {
    this.saveButton = document.getElementById('saveKeyButton')
    this.analyzeButton = document.getElementById('analyzeButton')
    this.todoistCheckbox = document.getElementById('todoistOptions')
    this.changelogButton = document.getElementById('changelog')

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

  async setOpenAIToken() {
    const openAIToken = document.getElementById('openAIToken').value
    await chrome.storage.local.set({'openAIToken': openAIToken})
  }

  async saveOptions() {
    const enableTodoistOptions = this.todoistCheckbox.checked
    await chrome.storage.sync.set({'enableTodoistOptions': enableTodoistOptions})
  }

  async saveButtonClicked() {
    this.saveButton.disabled = true
    const openAIToken = document.getElementById('openAIToken').value
    if (openAIToken !== '') {
      await this.setOpenAIToken(openAIToken)
    }
    await this.saveOptions()
    this.saveButton.disabled = false
    this.analyzeButton.disabled = false
    this.saveButton.textContent = 'Saved!'
    await sleep(3000)
    this.saveButton.textContent = 'Save'
  }

  setSectionDisplay(tabToShow, sectionToShow, tabsToHide, sectionsToHide) {
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
   *
   * @returns {Promise<void>} A promise that resolves when the version badges are handled.
   */
  async handleNewVersionBadge() {
    const badgeBackgroundText = await chrome.action.getBadgeText({})
    if (badgeBackgroundText === '') {
      const infoTab = document.getElementById('infoTab')
      const tabBadge = infoTab.querySelector('.badge')
      const whatsNewBadge = document.getElementById('whatsNewBadge')
      tabBadge.style.display = 'none'
      whatsNewBadge.style.display = 'none'
    }
  }

  async popupLoaded() {
    const actionsTab = document.getElementById('actionsTab')
    const settingsTab = document.getElementById('settingsTab')
    const infoTab = document.getElementById('infoTab')
    const actionsSection = document.getElementById('actionsSection')
    const settingsSection = document.getElementById('settingsSection')
    const infoSection = document.getElementById('infoSection')

    const todoistEnabled = await getSyncedSetting('enableTodoistOptions', false)
    if (todoistEnabled) {
      this.todoistCheckbox.setAttribute('checked', 'checked')
    }
    else if (typeof this.todoistCheckbox['removeAttribute'] === 'function'
      && this.todoistCheckbox.hasAttribute('checked')) {
      this.todoistCheckbox.removeAttribute('checked')
    }

    this.setSectionDisplay(actionsTab, actionsSection, [settingsTab, infoTab], [settingsSection, infoSection])
    this.setSectionDisplay(settingsTab, settingsSection, [actionsTab, infoTab], [actionsSection, infoSection])
    this.setSectionDisplay(infoTab, infoSection, [actionsTab, settingsTab], [actionsSection, settingsSection])

    this.handleNewVersionBadge().catch((e) => {
      console.error(e)
      Sentry.captureException(e)
    })
    const versionSpan = document.getElementById('versionInfo')
    const version = await chrome.runtime.getManifest().version
    versionSpan.textContent = `Version: ${version}`
    new NotesPopup()
    sendEvent('popup_loaded', {page_title: 'Popup', page_location: '/popup.html'}).catch((e) => {
      console.error(e)
      Sentry.captureException(e)
    })
  }
}
