import {captureException} from '@sentry/browser'

import {AiFunctions} from '@sx/analyze/ai-functions'
import {analyzeStoryDescription} from '@sx/analyze/analyze-story-description'
import {activate, handleMessage} from '@sx/content-scripts'
import {CycleTime} from '@sx/cycle-time/cycle-time'
import {DevelopmentTime} from '@sx/development-time/development-time'
import changeIteration from '@sx/keyboard-shortcuts/change-iteration'
import changeState from '@sx/keyboard-shortcuts/change-state'
import copyGitBranch from '@sx/keyboard-shortcuts/copy-git-branch'
import {NotesButton} from '@sx/notes/notes-button'
import {Todoist} from '@sx/todoist/todoist'
import {getSyncedSetting} from '@sx/utils/get-synced-setting'
import storyPageIsReady from '@sx/utils/story-page-is-ready'


jest.mock('@sx/development-time/development-time', () => ({
  DevelopmentTime: {
    set: jest.fn().mockResolvedValue(null)
  }
}))
jest.mock('@sx/cycle-time/cycle-time', () => ({
  CycleTime: {
    set: jest.fn().mockResolvedValue(null)
  }
}))
jest.mock('@sx/analyze/analyze-story-description', () => {
  return {
    analyzeStoryDescription: jest.fn().mockResolvedValue(null)
  }
})
const mockAiFunctions = jest.mock('@sx/analyze/ai-functions', () => {
  return {
    AiFunctions: jest.fn().mockImplementation(() => {
      return {
        addButtons: jest.fn().mockResolvedValue(null)
      }
    })
  }
})

jest.mock('@sx/notes/notes-button', () => {
  return {
    NotesButton: jest.fn().mockImplementation(() => {
    })
  }
})
jest.mock('@sx/keyboard-shortcuts/keyboard-shortcuts', () => {
  return {
    KeyboardShortcuts: jest.fn().mockImplementation(() => {
      return {
        activate: jest.fn()
      }
    })
  }
})
jest.mock('@sx/todoist/todoist', () => {
  return {
    Todoist: {
      setTaskButtons: jest.fn().mockResolvedValue(null)
    }
  }
})
jest.mock('@sx/utils/story-page-is-ready', () => jest.fn())
const mockedStoryPageIsReady = storyPageIsReady as jest.MockedFunction<typeof storyPageIsReady>

jest.mock('@sx/utils/get-synced-setting', () => ({
  getSyncedSetting: jest.fn().mockResolvedValue(true)
}))
const mockedGetSyncedSetting = getSyncedSetting as jest.MockedFunction<typeof getSyncedSetting>

jest.mock('@sentry/browser', () => ({
  captureException: jest.fn(),
  init: jest.fn()
}))
jest.mock('@sx/utils/log-error', () => jest.fn())
jest.mock('@sx/keyboard-shortcuts/change-state', () => jest.fn())
jest.mock('@sx/keyboard-shortcuts/change-iteration', () => jest.fn())
jest.mock('@sx/keyboard-shortcuts/copy-git-branch', () => jest.fn())
jest.mock('@sx/utils/sleep', () => jest.fn().mockResolvedValue(null))


describe('activate function', () => {
  it('should activate features', async () => {
    const developmentTime = jest.spyOn(DevelopmentTime, 'set').mockResolvedValue()
    const cycleTime = jest.spyOn(CycleTime, 'set').mockResolvedValue()
    const addButtons = jest.spyOn(AiFunctions.prototype, 'addButtons')

    await activate()

    expect(mockedStoryPageIsReady).toHaveBeenCalled()
    expect(developmentTime).toHaveBeenCalled()
    expect(cycleTime).toHaveBeenCalled()
    expect(addButtons).toHaveBeenCalled()
  })
})

describe('handleMessage function', () => {
  const originalLocation = window.location

  beforeEach(() => {
    interface MockLocation extends Location {
    }

    const mockLocation: Partial<MockLocation> = {
      href: 'https://example.com/story',
      assign: jest.fn(),
      reload: jest.fn()
    }
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true
    })
    jest.clearAllMocks()
  })

  afterEach(() => {
    window.location = originalLocation
  })


  it('calls analyzeStoryDescription for analyzeStoryDescription message', async () => {
    const request = {message: 'analyzeStoryDescription', url: ''}
    await handleMessage(request)
    expect(analyzeStoryDescription).toHaveBeenCalledWith('https://example.com/story')
  })

  it('initializes on update message', async () => {
    const spy = jest.spyOn(AiFunctions.prototype, 'addButtons')
    mockedGetSyncedSetting.mockResolvedValue(true)
    const request = {message: 'update', url: 'https://example.com/story'}
    await handleMessage(request)
    expect(DevelopmentTime.set).toHaveBeenCalled()
    expect(CycleTime.set).toHaveBeenCalled()
    expect(NotesButton).toHaveBeenCalled()
    expect(Todoist.setTaskButtons).toHaveBeenCalled()
    expect(spy).toHaveBeenCalled()
  })

  it('calls changeState for change-state message', async () => {
    const request = {message: 'change-state', url: 'https://example.com/story'}
    await handleMessage(request)
    expect(changeState).toHaveBeenCalled()
  })

  it('calls changeIteration for change-iteration message', async () => {
    const request = {message: 'change-iteration', url: 'https://example.com/story'}
    await handleMessage(request)
    expect(changeIteration).toHaveBeenCalled()
  })

  it('calls copyGitBranch for copy-git-branch message', async () => {
    const request = {message: 'copy-git-branch', url: 'https://example.com/story'}
    await handleMessage(request)
    expect(copyGitBranch).toHaveBeenCalled()
  })
})
