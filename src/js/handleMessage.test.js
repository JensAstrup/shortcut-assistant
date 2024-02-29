import {handleMessage} from './contentScripts'
import {logError} from './utils/utils'
import {DevelopmentTime} from './developmentTime/developmentTime'
import {CycleTime} from './cycleTime/cycleTime'
import {analyzeStoryDescription} from './analyze/analyzeStoryDescription'
import {NotesButton} from './notes/notesButton'
import {Todoist} from './todoist/Todoist'


jest.mock('./developmentTime/developmentTime', () => ({
  DevelopmentTime: {
    set: jest.fn().mockResolvedValue()
  }
}))
jest.mock('./cycleTime/cycleTime', () => ({
  CycleTime: {
    set: jest.fn().mockResolvedValue()
  }
}))
jest.mock('./analyze/analyzeStoryDescription', () => {
  return {
    analyzeStoryDescription: jest.fn().mockResolvedValue()
  }
})
jest.mock('./notes/notesButton', () => {
  return {
    NotesButton: jest.fn().mockImplementation(() => {
    })
  }
})
jest.mock('./todoist/Todoist', () => {
  return {
    Todoist: jest.fn().mockImplementation(() => {
    })
  }
})
jest.mock('./utils/utils', () => ({
  logError: jest.fn()
}))


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
