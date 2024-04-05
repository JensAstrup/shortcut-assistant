import {handleMessage} from '../src/js/content-scripts'
import {DevelopmentTime} from '../src/js/development-time/development-time'
import {CycleTime} from '../src/js/cycle-time/cycle-time'
import {analyzeStoryDescription} from '../src/js/analyze/analyze-story-description'
import {NotesButton} from '../src/js/notes/notes-button'
import {Todoist} from '../src/js/todoist/todoist'


jest.mock('../src/js/development-time/development-time', () => ({
  DevelopmentTime: {
    set: jest.fn().mockResolvedValue()
  }
}))
jest.mock('../src/js/cycle-time/cycle-time', () => ({
  CycleTime: {
    set: jest.fn().mockResolvedValue()
  }
}))
jest.mock('../src/js/analyze/analyze-story-description', () => {
  return {
    analyzeStoryDescription: jest.fn().mockResolvedValue()
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
    Todoist: jest.fn().mockImplementation(() => {
    })
  }
})
jest.mock('../src/js/utils/log-error', () => jest.fn())


describe('handleMessage function', () => {
  const originalLocation = window.location

  beforeEach(() => {
    delete window.location
    window.location = {href: 'https://example.com/story'}
    jest.clearAllMocks()
  })

  afterEach(() => {
    window.location = originalLocation
  })

  it('initializes DevelopmentTime and CycleTime for initDevelopmentTime message', async () => {
    const request = {message: 'initDevelopmentTime', url: 'https://example.com/story'}
    await handleMessage(request, {}, jest.fn())
    expect(DevelopmentTime.set).toHaveBeenCalled()
    expect(CycleTime.set).toHaveBeenCalled()
  })

  it('calls analyzeStoryDescription for analyzeStoryDescription message', async () => {
    const request = {message: 'analyzeStoryDescription', url: ''}
    await handleMessage(request, {}, jest.fn())
    expect(analyzeStoryDescription).toHaveBeenCalledWith('https://example.com/story')
  })

  it('initializes NotesButton for initNotes message', async () => {
    const request = {message: 'initNotes', url: 'https://example.com/story'}
    NotesButton
    await handleMessage(request, {}, jest.fn())
    expect(NotesButton).toHaveBeenCalled()
  })

  it('initializes Todoist for initTodos message', async () => {
    const request = {message: 'initTodos', url: 'https://example.com/story'}
    await handleMessage(request, {}, jest.fn())
    expect(Todoist).toHaveBeenCalled()
  })

  it('does not initialize DevelopmentTime and CycleTime for unrelated URL', async () => {
    const request = {message: 'initDevelopmentTime', url: 'https://example.com/unrelated'}
    await handleMessage(request, {}, jest.fn())
    expect(DevelopmentTime.set).not.toHaveBeenCalled()
    expect(CycleTime.set).not.toHaveBeenCalled()
  })
})
