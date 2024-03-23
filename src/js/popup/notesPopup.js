import sleep from '../utils/sleep'
import {Story} from '../utils/story'


export class NotesPopup {
  constructor() {
    const saveButton = document.getElementById('saveButton')
    saveButton.addEventListener('click', this.save.bind(this))
    this.set.bind(this)().catch(console.error)
    this.saveButton = saveButton
  }

  _autoExpandTextarea() {
    this.style.height = 'auto'
    this.style.height = (this.scrollHeight) + 'px'
  }

  async resizeInput() {
    const storyNotesInput = this.getInput()
    storyNotesInput.addEventListener('input', this._autoExpandTextarea)
  }

  async save() {
    const data = {[this.getKey(await Story.id())]: this.getInput().value}
    await chrome.storage.sync.set(data)
    this.saveButton.textContent = 'Saved!'
    await sleep(2000)
    this.saveButton.textContent = 'Save'
  }

  getInput() {
    return document.getElementById('storyNotes')
  }

  getKey(storyId) {
    return 'notes_' + storyId
  }

  async set() {
    this.resizeInput().catch(console.error)
    const key = this.getKey(await Story.id())
    const storyNotesInput = this.getInput()
    const result = await chrome.storage.sync.get(key)
    const value = result[key]
    if (value !== undefined) {
      storyNotesInput.value = value
    }
  }

  static async handleMessage(message, sender, sendResponse) {
    if (message.message === 'checkNotes') {
      new NotesPopup()
    }
  }
}


chrome.runtime.onMessage.addListener(NotesPopup.handleMessage)
