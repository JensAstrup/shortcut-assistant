import {NotesPopup} from '../../src/js/popup/notes-popup'
import {Story} from '../../src/js/utils/story'


jest.mock('../../src/js/utils/story', () => ({
  Story: {
    id: jest.fn()
  }
}))
jest.mock('../../src/js/utils/sleep', () => jest.fn(() => Promise.resolve()))


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


describe('NotesPopup', () => {
  let inputElement

  beforeEach(() => {
    document.body.innerHTML = `
      <input id="storyNotes" />
      <button id="saveButton">Save</button>
    `
    jest.clearAllMocks()
    global.chrome.storage.sync.set = jest.fn(() => Promise.resolve())
    global.chrome.storage.sync.get = jest.fn(() => Promise.resolve({}))
    global.chrome.runtime.onMessage.addListener = jest.fn()
    inputElement = document.getElementById('storyNotes')
  })

  it('attaches click event listener to saveButton on instantiation', () => {
    const addEventListenerSpy = jest.spyOn(document.getElementById('saveButton'), 'addEventListener')
    new NotesPopup()
    expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
  })

  it('throws error if saveButton is not found', () => {
    document.body.innerHTML = ''
    expect(() => new NotesPopup()).toThrow('saveButton not found')
  })

  it('saves note and updates button text correctly', async () => {
    Story.id.mockResolvedValue('123')
    const popup = new NotesPopup()
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
    const storyNotesInput = document.getElementById('storyNotes')
    storyNotesInput.value = 'Test note'
    await popup.save()
    expect(global.chrome.storage.sync.set).toHaveBeenCalledWith({'notes_123': 'Test note'})
    expect(popup.saveButton.textChanges).toContain('Saved!')
    expect(popup.saveButton.textChanges).toContain('Save')
  })

  it('retrieves and displays saved note', async () => {
    Story.id.mockResolvedValue('123')
    global.chrome.storage.sync.get.mockResolvedValue({'notes_123': 'Saved note'})
    const popup = new NotesPopup()
    await popup.set()
    expect(document.getElementById('storyNotes').value).toBe('Saved note')
  })

  it('throws an error if storyNotesInput is not found', async () => {
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'storyNotes') {
        return null
      }
      return mockElement({
        value: id === 'openAIToken' ? 'test-token' : '',
        checked: true,
        textContent: ''
      })
    }
    )
    const popup = new NotesPopup()
    await expect(popup.set()).rejects.toThrow('storyNotesInput not found')
  })

  it('handles message to check notes', async () => {
    const fakeMessage = {message: 'checkNotes'}
    await expect(NotesPopup.handleMessage(fakeMessage)).resolves.toBeUndefined()
  })

})
