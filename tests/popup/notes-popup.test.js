import {Story} from '../../src/js/utils/story'
import {NotesPopup} from '../../src/js/popup/notes-popup'


jest.mock('../../src/js/utils/story', () => ({
  Story: {
    id: jest.fn()
  }
}))
jest.mock('../../src/js/utils/sleep', () => jest.fn(() => Promise.resolve()))

describe('NotesPopup', () => {
  let messageListenerCallback

  beforeEach(() => {
    document.body.innerHTML = `
      <input id="storyNotes" />
      <button id="saveButton">Save</button>
    `
    jest.clearAllMocks()
    global.chrome.storage.sync.set = jest.fn(() => Promise.resolve())
    global.chrome.storage.sync.get = jest.fn(() => Promise.resolve({}))
    global.chrome.runtime.onMessage.addListener = jest.fn((callback) => {
      messageListenerCallback = callback
    })
  })

  it('attaches click event listener to saveButton on instantiation', () => {
    const addEventListenerSpy = jest.spyOn(document.getElementById('saveButton'), 'addEventListener')
    new NotesPopup()
    expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
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
  it('auto-expands textarea on input', () => {
    const popup = new NotesPopup()
    const inputEvent = new Event('input')
    const storyNotesInput = document.getElementById('storyNotes')
    jest.spyOn(storyNotesInput, 'addEventListener')
    popup.resizeInput()
    expect(storyNotesInput.addEventListener).toHaveBeenCalledWith('input', expect.any(Function))
    storyNotesInput.dispatchEvent(inputEvent)
  })
  it('handles message to check notes', async () => {
    const fakeMessage = {message: 'checkNotes'}
    await expect(NotesPopup.handleMessage(fakeMessage)).resolves.toBeUndefined()
  })

})
