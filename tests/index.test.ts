import {activate} from '@sx/content-scripts'
import {getSyncedSetting} from '@sx/utils/get-synced-setting'
import storyPageIsReady from '../src/js/utils/story-page-is-ready'
import {CycleTime} from '@sx/cycle-time/cycle-time'
import {DevelopmentTime} from '@sx/development-time/development-time'
import {Todoist} from '@sx/todoist/todoist'
import {NotesButton} from '@sx/notes/notes-button'
import {KeyboardShortcuts} from '@sx/keyboard-shortcuts/keyboard-shortcuts'
import Manifest = chrome.runtime.Manifest


jest.mock('@sentry/browser')
jest.mock('../src/js/cycle-time/cycle-time', () => ({
  CycleTime: {
    set: jest.fn().mockResolvedValue(null)
  }
}))
jest.mock('../src/js/development-time/development-time', () => ({
  DevelopmentTime: {
    set: jest.fn().mockResolvedValue(null)
  }
}))
jest.mock('../src/js/todoist/todoist')
jest.mock('../src/js/notes/notes-button')
jest.mock('../src/js/keyboard-shortcuts/keyboard-shortcuts')
jest.mock('../src/js/utils/story-page-is-ready', () => jest.fn().mockResolvedValue(null))
jest.mock('../src/js/utils/get-synced-setting', () => ({
  getSyncedSetting: jest.fn()
}))
const mockedGetSyncedSetting = getSyncedSetting as jest.Mock

global.chrome = {
  runtime: {
    getManifest: jest.fn(() => ({version: '1.0.0'} as Manifest)),
    // @ts-expect-error Migrating from JS
    onMessage: {
      addListener: jest.fn()
    }
  }
}

describe('activate function', () => {
  let originalError: typeof console.error

  beforeEach(() => {
    jest.clearAllMocks()
    originalError = console.error
    console.error = jest.fn()
  })

  afterEach(() => {
    console.error = originalError
  })

  it('waits for 3 seconds before proceeding', async () => {
    await activate()
    expect(storyPageIsReady).toHaveBeenCalled()
  })

  it('initializes CycleTime', async () => {
    await activate()
    expect(CycleTime.set).toHaveBeenCalled()
  })

  it('logs an error if CycleTime.set fails', async () => {
    jest.spyOn(CycleTime, 'set').mockRejectedValueOnce(new Error('Test Error'))
    await activate()
    expect(console.error).toHaveBeenCalledWith(expect.any(Error))
  })

  it('initializes DevelopmentTime', async () => {
    await activate()
    expect(DevelopmentTime.set).toHaveBeenCalled()
  })

  it('logs an error if DevelopmentTime.set fails', async () => {
    jest.spyOn(DevelopmentTime, 'set').mockRejectedValueOnce(new Error('Test Error'))
    await activate()
    expect(console.error).toHaveBeenCalledWith(expect.any(Error))
  })

  it('conditionally initializes Todoist based on enableTodoistOptions setting', async () => {
    const setTaskButtons = jest.spyOn(Todoist, 'setTaskButtons').mockResolvedValue(undefined)
    mockedGetSyncedSetting.mockResolvedValueOnce(false)
    await activate()
    expect(setTaskButtons).not.toHaveBeenCalled()

    mockedGetSyncedSetting.mockResolvedValueOnce(true)

    await activate()
    expect(setTaskButtons).toHaveBeenCalledTimes(1)
  })

  it('instantiates NotesButton and activates KeyboardShortcuts unconditionally', async () => {
    await activate()
    expect(NotesButton).toHaveBeenCalled()
    expect(KeyboardShortcuts).toHaveBeenCalled()
    // @ts-expect-error Migrating from JS
    expect(KeyboardShortcuts.mock.instances[0].activate).toHaveBeenCalled()
  })

  it('handles getSyncedSetting failure gracefully', async () => {
    mockedGetSyncedSetting.mockRejectedValueOnce(new Error('Failed to fetch setting'))
    await activate()
    expect(console.error).toHaveBeenCalledWith(expect.any(Error))
  })
})
