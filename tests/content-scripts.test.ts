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

jest.mock('@sentry/browser', () => ({
  captureException: jest.fn(),
  init: jest.fn()
}))
jest.mock('@sx/utils/log-error', () => jest.fn())
jest.mock('@sx/keyboard-shortcuts/change-state', () => jest.fn())
jest.mock('@sx/keyboard-shortcuts/change-iteration', () => jest.fn())
jest.mock('@sx/keyboard-shortcuts/copy-git-branch', () => jest.fn())


describe('activate function', () => {
  it('should catch and handle errors from addAnalyzeButton', async () => {
    const errorMessage = 'Analyze button error'
    jest.spyOn(AiFunctions, 'addAnalyzeButton').mockRejectedValue(new Error(errorMessage))
    jest.spyOn(DevelopmentTime, 'set').mockResolvedValue()
    jest.spyOn(CycleTime, 'set').mockResolvedValue()

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
    })

    await activate()

    expect(mockedStoryPageIsReady).toHaveBeenCalled()
    expect(AiFunctions.addAnalyzeButton).toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalledWith(expect.any(Error)) // Checking if console.error was called with an error
    expect(captureException).toHaveBeenCalledWith(expect.any(Error)) // Check if Sentry captured the exception

    errorSpy.mockRestore()
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

  it('initializes DevelopmentTime and CycleTime for initDevelopmentTime message', async () => {
    const request = {message: 'initDevelopmentTime', url: 'https://example.com/story'}
    await handleMessage(request)
    expect(DevelopmentTime.set).toHaveBeenCalled()
    expect(CycleTime.set).toHaveBeenCalled()
  })

  it('calls analyzeStoryDescription for analyzeStoryDescription message', async () => {
    const request = {message: 'analyzeStoryDescription', url: ''}
    await handleMessage(request)
    expect(analyzeStoryDescription).toHaveBeenCalledWith('https://example.com/story')
  })

  it('initializes NotesButton for initNotes message', async () => {
    const request = {message: 'initNotes', url: 'https://example.com/story'}
    NotesButton
    await handleMessage(request)
    expect(NotesButton).toHaveBeenCalled()
  })

  it('initializes Todoist for initTodos message', async () => {
    const request = {message: 'initTodos', url: 'https://example.com/story'}
    await handleMessage(request)
    expect(Todoist.setTaskButtons).toHaveBeenCalled()
  })

  it('does not initialize DevelopmentTime and CycleTime for unrelated URL', async () => {
    const request = {message: 'initDevelopmentTime', url: 'https://example.com/unrelated'}
    await handleMessage(request)
    expect(DevelopmentTime.set).not.toHaveBeenCalled()
    expect(CycleTime.set).not.toHaveBeenCalled()
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
