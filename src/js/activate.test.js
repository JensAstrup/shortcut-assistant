import {activate} from './contentScripts'
import {getSyncedSetting} from './utils/getSyncedSetting'
import * as utils from './utils/utils'
import * as settings from './utils/getSyncedSetting'
import Sentry from '@sentry/browser'
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
  ...jest.requireActual('./utils/utils'), // This is if you want to keep some original implementations
  sleep: jest.fn().mockResolvedValue()
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
    console.error = jest.fn() // Mock console.error
  })

  afterEach(() => {
    console.error = originalError // Restore original console.error
  })

  it('waits for 3 seconds before proceeding', async () => {
    await activate()
    expect(utils.sleep).toHaveBeenCalledWith(3000)
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
    getSyncedSetting.mockResolvedValueOnce(false) // For Todoist, assuming false disables it
    await activate()
    expect(Todoist).not.toHaveBeenCalled()

    settings.getSyncedSetting.mockResolvedValueOnce(true) // Now true enables it
    await activate()
    expect(Todoist).toHaveBeenCalledTimes(1) // Adjust based on call count expected
  })

  it('instantiates NotesButton and activates KeyboardShortcuts unconditionally', async () => {
    await activate()
    expect(NotesButton).toHaveBeenCalled()
    expect(KeyboardShortcuts).toHaveBeenCalled()
    expect(KeyboardShortcuts.mock.instances[0].activate).toHaveBeenCalled()
  })

  // Assuming you add error handling for getSyncedSetting failure
  it('handles getSyncedSetting failure gracefully', async () => {
    getSyncedSetting.mockRejectedValueOnce(new Error('Failed to fetch setting'))
    await activate()
    // Expect some form of error handling or default behavior
    // This is hypothetical and depends on your error handling strategy
    expect(console.error).toHaveBeenCalledWith(expect.any(Error))
  })

  // Add more tests as necessary for error handling, etc.
})
