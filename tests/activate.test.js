import {activate} from '../src/js/content-scripts'
import {getSyncedSetting} from '../src/js/utils/getSyncedSetting'
import storyPageIsReady from '../src/js/utils/storyPageIsReady'
import {CycleTime} from '../src/js/cycle-time/cycle-time'
import {DevelopmentTime} from '../src/js/development-time/development-time'
import {Todoist} from '../src/js/todoist/Todoist'
import {NotesButton} from '../src/js/notes/notesButton'
import {KeyboardShortcuts} from '../src/js/keyboard/keyboardShortcuts'


jest.mock('@sentry/browser')
jest.mock('../src/js/cycle-time/cycle-time', () => ({
  CycleTime: {
    set: jest.fn().mockResolvedValue()
  }
}))
jest.mock('../src/js/development-time/development-time', () => ({
  DevelopmentTime: {
    set: jest.fn().mockResolvedValue()
  }
}))
jest.mock('../src/js/todoist/Todoist')
jest.mock('../src/js/notes/notesButton')
jest.mock('../src/js/keyboard/keyboardShortcuts')
jest.mock('../src/js/utils/storyPageIsReady', () => jest.fn().mockResolvedValue())
jest.mock('../src/js/utils/getSyncedSetting', () => ({
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
