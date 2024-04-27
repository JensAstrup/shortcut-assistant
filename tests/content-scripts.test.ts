import {analyzeStoryDescription} from '@sx/analyze/analyze-story-description'
import {handleMessage} from '@sx/content-scripts'
import {CycleTime} from '@sx/cycle-time/cycle-time'
import {DevelopmentTime} from '@sx/development-time/development-time'
import changeIteration from '@sx/keyboard-shortcuts/change-iteration'
import changeState from '@sx/keyboard-shortcuts/change-state'
import copyGitBranch from '@sx/keyboard-shortcuts/copy-git-branch'
import {NotesButton} from '@sx/notes/notes-button'
import {Todoist} from '@sx/todoist/todoist'


jest.mock('../src/js/development-time/development-time', () => ({
  DevelopmentTime: {
    set: jest.fn().mockResolvedValue(null)
  }
}))
jest.mock('../src/js/cycle-time/cycle-time', () => ({
  CycleTime: {
    set: jest.fn().mockResolvedValue(null)
  }
}))
jest.mock('../src/js/analyze/analyze-story-description', () => {
  return {
    analyzeStoryDescription: jest.fn().mockResolvedValue(null)
  }
})
jest.mock('../src/js/notes/notes-button', () => {
  return {
    NotesButton: jest.fn().mockImplementation(() => {
    })
  }
})
jest.mock('../src/js/todoist/todoist', () => {
  return {
    Todoist: {
      setTaskButtons: jest.fn().mockResolvedValue(null)
    }
  }
})
jest.mock('../src/js/utils/log-error', () => jest.fn())
jest.mock('../src/js/keyboard-shortcuts/change-state', () => jest.fn())
jest.mock('../src/js/keyboard-shortcuts/change-iteration', () => jest.fn())
jest.mock('../src/js/keyboard-shortcuts/copy-git-branch', () => jest.fn())


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
