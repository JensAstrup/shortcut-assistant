import {activate} from './contentScripts'
import {getSyncedSetting} from './utils/getSyncedSetting'
import {storyPageIsReady} from './utils/utils'
import * as utils from './utils/utils'
import {CycleTime} from './cycleTime/cycleTime'
import {DevelopmentTime} from './developmentTime/developmentTime'
import {Todoist} from './todoist/Todoist'
import {NotesButton} from './notes/notesButton'
import {KeyboardShortcuts} from './keyboard/keyboardShortcuts'


jest.mock('@sentry/browser')
jest.mock('./cycleTime/cycleTime', () => ({
  CycleTime: {
    set: jest.fn().mockResolvedValue()
  }
}))
jest.mock('./developmentTime/developmentTime', () => ({
  DevelopmentTime: {
    set: jest.fn().mockResolvedValue()
  }
}))
jest.mock('./todoist/Todoist')
jest.mock('./notes/notesButton')
jest.mock('./keyboard/keyboardShortcuts')
jest.mock('./utils/utils', () => ({
  storyPageIsReady: jest.fn().mockResolvedValue()
}))
jest.mock('./utils/getSyncedSetting', () => ({
  getSyncedSetting: jest.fn()
}))

global.chrome = {
  runtime: {
    getManifest: jest.fn(() => ({version: '1.0.0'})),
    onMessage: {
      addListener: jest.fn()
    }
  }
}

describe('activate function', () => {
  let originalError

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
    CycleTime.set.mockRejectedValueOnce(new Error('Test Error'))
    await activate()
    expect(console.error).toHaveBeenCalledWith(expect.any(Error))
  })

  it('initializes DevelopmentTime', async () => {
    await activate()
    expect(DevelopmentTime.set).toHaveBeenCalled()
  })

  it('logs an error if DevelopmentTime.set fails', async () => {
    DevelopmentTime.set.mockRejectedValueOnce(new Error('Test Error'))
    await activate()
    expect(console.error).toHaveBeenCalledWith(expect.any(Error))
  })

  it('conditionally initializes Todoist based on enableTodoistOptions setting', async () => {
    getSyncedSetting.mockResolvedValueOnce(false)
    await activate()
    expect(Todoist).not.toHaveBeenCalled()

    getSyncedSetting.mockResolvedValueOnce(true)
    await activate()
    expect(Todoist).toHaveBeenCalledTimes(1)
  })

  it('instantiates NotesButton and activates KeyboardShortcuts unconditionally', async () => {
    await activate()
    expect(NotesButton).toHaveBeenCalled()
    expect(KeyboardShortcuts).toHaveBeenCalled()
    expect(KeyboardShortcuts.mock.instances[0].activate).toHaveBeenCalled()
  })

  it('handles getSyncedSetting failure gracefully', async () => {
    getSyncedSetting.mockRejectedValueOnce(new Error('Failed to fetch setting'))
    await activate()
    expect(console.error).toHaveBeenCalledWith(expect.any(Error))
  })
})
