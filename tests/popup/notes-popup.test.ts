import {NotesPopup} from '@sx/popup/notes-popup'
import {Story} from '@sx/utils/story'


jest.mock('@sx/utils/story', () => ({
  Story: {
    id: jest.fn()
  }
}))
const mockedStory = Story as jest.Mocked<typeof Story>

jest.mock('@sx/utils/sleep', () => jest.fn(() => Promise.resolve()))


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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let inputElement: HTMLInputElement

  beforeEach(() => {
    document.body.innerHTML = `
      <input id="storyNotes" />
      <button id="saveButton">Save</button>
    `
    jest.clearAllMocks()
    global.chrome.storage.sync.set = jest.fn(() => Promise.resolve())
    global.chrome.storage.sync.get = jest.fn(() => Promise.resolve({}))
    global.chrome.runtime.onMessage.addListener = jest.fn()
    inputElement = <HTMLInputElement>document.getElementById('storyNotes')
  })

  it('attaches click event listener to saveButton on instantiation', () => {
    // @ts-expect-error - TS doesn't know about the mock implementation
    const addEventListenerSpy = jest.spyOn(document.getElementById('saveButton'), 'addEventListener')
    new NotesPopup()
    expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
  })

  it('throws error if saveButton is not found', () => {
    document.body.innerHTML = ''
    expect(() => new NotesPopup()).toThrow('saveButton not found')
  })

  it('saves note and updates button text correctly', async () => {
    mockedStory.id.mockResolvedValue('123')
    const popup = new NotesPopup()
    // @ts-expect-error - TS doesn't know about _textContent
    popup.saveButton = {
      // @ts-expect-error - TS doesn't know about disabled
      disabled: false,
      get textContent() {
        // @ts-expect-error - TS doesn't know about _textContent
        return this._textContent
      },
      set textContent(value) {
        // @ts-expect-error - TS doesn't know about _textContent
        this._textContent = value
        // @ts-expect-error - TS doesn't know about textChanges
        this.textChanges.push(value)
      },
      textChanges: []
    }
    const storyNotesInput = <HTMLInputElement>document.getElementById('storyNotes')
    storyNotesInput.value = 'Test note'
    await popup.save()
    expect(global.chrome.storage.sync.set).toHaveBeenCalledWith({'notes_123': 'Test note'})
    // @ts-expect-error - Migrating from JS
    expect(popup.saveButton.textChanges).toContain('Saved!')
    // @ts-expect-error - Migrating from JS
    expect(popup.saveButton.textChanges).toContain('Save')
  })

  it('retrieves and displays saved note', async () => {
    mockedStory.id.mockResolvedValue('123')
    // @ts-expect-error - Migrating from JS
    global.chrome.storage.sync.get.mockResolvedValue({'notes_123': 'Saved note'})
    const popup = new NotesPopup()
    await popup.set()
    // @ts-expect-error - Migrating from JS
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
    console.error = jest.fn()
    const popup = new NotesPopup()
    await expect(popup.set()).rejects.toThrow('storyNotesInput not found')
    expect(console.error).toHaveBeenCalled()
  })

  it('handles message to check notes', async () => {
    const fakeMessage = {message: 'checkNotes'}
    await expect(NotesPopup.handleMessage(fakeMessage)).resolves.toBeUndefined()
  })

})
