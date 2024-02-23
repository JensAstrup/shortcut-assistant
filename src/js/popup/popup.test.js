/**
 * @jest-environment jsdom
 */

import {Popup} from './Popup'
import * as Sentry from '@sentry/browser'
import {sendEvent} from '../analytics/event'
import {getSyncedSetting} from '../serviceWorker/utils'
import {NotesPopup} from './notesPopup'
import {sleep} from '../utils/utils'


jest.mock('@sentry/browser')
jest.mock('../analytics/event')
jest.mock('../serviceWorker/utils')
jest.mock('../utils/utils', () => ({
  sleep: jest.fn().mockResolvedValue()
}))
jest.mock('./notesPopup')


const mockElement = (options = {}) => {
  return {
    addEventListener: jest.fn(),
    click: jest.fn(),
    querySelector: jest.fn(() => ({
      style: {
        display: ''
      }
    })),
    ...options
  }
}

describe('Popup', () => {
  let popup
  let getElementById

  beforeEach(() => {

    getElementById = jest.spyOn(document, 'getElementById').mockImplementation((id) => {
          return mockElement({
            value: id === 'openAIToken' ? 'test-token' : '',
            checked: true,
            textContent: ''
          })
      }
    )
    sleep.mockResolvedValue()
    popup = new Popup()
  })

  afterEach(() => {
    getElementById.mockRestore()
  })

  test('constructor initializes event listeners', () => {
    document.addEventListener = jest.fn()
    window.addEventListener = jest.fn()
    popup = new Popup()
    expect(getElementById).toHaveBeenCalledWith('saveKeyButton')
    expect(getElementById).toHaveBeenCalledWith('analyzeButton')
    expect(getElementById).toHaveBeenCalledWith('stalledWorkToggle')
    expect(getElementById).toHaveBeenCalledWith('todoistOptions')
    expect(getElementById).toHaveBeenCalledWith('changelog')
    expect(popup.saveButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))
    expect(popup.changelogButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))
    expect(document.addEventListener).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function))
    expect(window.addEventListener).toHaveBeenCalledWith('load', expect.any(Function))
  })

  test('sendEvent is called on window load', async () => {
    sendEvent.mockResolvedValue()
    popup = new Popup()
    window.dispatchEvent(new Event('load'))
    expect(sendEvent).toHaveBeenCalledWith('popup_view')
  })

  test('sendEvent is called on window load, logs errors', async () => {
    console.error = jest.fn()
    const error = new Error('test error')
    sendEvent.mockRejectedValue(error)
    popup = new Popup()
    window.dispatchEvent(new Event('load'))
    expect(sendEvent).toHaveBeenCalledWith('popup_view')
    // Wait for the promise passed to addEventListener to resolve
    await sleep(100)
    expect(console.error).toHaveBeenCalledWith(new Error('test error'))
    expect(Sentry.captureException).toHaveBeenCalled()
  })

  test('setOpenAIToken sets token in chrome storage', async () => {
    await popup.setOpenAIToken()
    expect(chrome.storage.local.set).toHaveBeenCalledWith({openAIToken: 'test-token'})
  })

  test('saveOptions sets options in chrome storage', async () => {
    await popup.saveOptions()
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({enableStalledWorkWarnings: true})
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({enableTodoistOptions: true})
  })

  test('saveButtonClicked', async () => {
    popup.saveButton = {
      disabled: false,
      get textContent() {
        return this._textContent
      },
      set textContent(value) {
        this._textContent = value
        this.textChanges.push(value)
      },
      textChanges: []
    }
    popup.setOpenAIToken = jest.fn().mockResolvedValue(null)
    popup.saveOptions = jest.fn().mockResolvedValue(null)

    await popup.saveButtonClicked()
    expect(popup.setOpenAIToken).toHaveBeenCalledWith('test-token')
    expect(popup.saveOptions).toHaveBeenCalled()
    expect(popup.saveButton.disabled).toBeFalsy()
    expect(popup.analyzeButton.disabled).toBeFalsy()
    expect(popup.saveButton.textChanges).toContain('Saved!')
    expect(popup.saveButton.textChanges).toContain('Save')

  })

  test('setSectionDisplay', () => {
    const tabToShow = document.createElement('div')
    const sectionToShow = document.createElement('div')
    const tabsToHide = [document.createElement('div'), document.createElement('div')]
    const sectionsToHide = [document.createElement('div'), document.createElement('div')]

    popup.setSectionDisplay(tabToShow, sectionToShow, tabsToHide, sectionsToHide)

    tabToShow.dispatchEvent(new Event('click'))

    expect(sectionToShow.classList.contains('hidden')).toBeFalsy()
    sectionsToHide.forEach(section => {
      expect(section.classList.contains('hidden')).toBeTruthy()
    })
    expect(tabToShow.classList.contains('tab-active')).toBeTruthy()
    tabsToHide.forEach(tab => {
      expect(tab.classList.contains('tab-active')).toBeFalsy()
    })
  })
})

describe('handleNewVersionBadge', () => {
  beforeEach(() => {
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'infoTab') {
        return {
          querySelector: jest.fn().mockReturnValue({style: {display: ''}})
        }
      }
      else if (id === 'whatsNewBadge') {
        return {style: {display: ''}}
      }
      else {
        return mockElement()
      }
    })
  })

  test('hides badges when badge text is empty', async () => {
    chrome.action.getBadgeText.mockResolvedValue('')

    const popup = new Popup()
    await popup.handleNewVersionBadge()

    const infoTab = document.getElementById('infoTab')
    const tabBadge = infoTab.querySelector('.badge')
    const whatsNewBadge = document.getElementById('whatsNewBadge')

    expect(tabBadge.style.display).toBe('')
    expect(whatsNewBadge.style.display).toBe('')
  })

  test('does nothing when badge text is not empty', async () => {
    chrome.action.getBadgeText.mockResolvedValue('New!')

    const popup = new Popup()
    await popup.handleNewVersionBadge()

    const infoTab = document.getElementById('infoTab')
    const tabBadge = infoTab.querySelector('.badge')
    const whatsNewBadge = document.getElementById('whatsNewBadge')

    expect(tabBadge.style.display).toBe('')
    expect(whatsNewBadge.style.display).toBe('')
  })
})

describe('popupLoaded', () => {
  let mockVersionSpan

  beforeEach(() => {
    Sentry.captureException.mockClear()
    sendEvent.mockClear()
    NotesPopup.mockClear()
    getSyncedSetting.mockClear()
    getSyncedSetting.mockResolvedValueOnce(true) // enableStalledWorkWarnings
    getSyncedSetting.mockResolvedValueOnce(false) // enableTodoistOptions

    mockVersionSpan = {
      textContent: ''
    }
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'versionInfo') {
        return mockVersionSpan
      }
      else {
        return {
          addEventListener: jest.fn(),
          querySelector: jest.fn().mockReturnValue({style: {display: 'block'}}),
          checked: false
        }
      }
    })
  })

  test('popupLoaded sets up correctly', async () => {

    const popup = new Popup()
    popup.handleNewVersionBadge = jest.fn().mockResolvedValue(null)
    await popup.popupLoaded()

    expect(document.getElementById).toHaveBeenCalledWith('actionsTab')
    expect(document.getElementById).toHaveBeenCalledWith('settingsTab')
    expect(document.getElementById).toHaveBeenCalledWith('infoTab')
    expect(document.getElementById).toHaveBeenCalledWith('versionInfo')
    expect(mockVersionSpan.textContent).toBe(`Version: 1.0.0`)

    expect(getSyncedSetting).toHaveBeenCalledWith('enableStalledWorkWarnings', true)
    expect(getSyncedSetting).toHaveBeenCalledWith('enableTodoistOptions', false)

    expect(NotesPopup).toHaveBeenCalled()

    expect(popup.handleNewVersionBadge).toHaveBeenCalled()
  })
})