import sleep from '@sx/utils/sleep'
import {Story} from '@sx/utils/story'


export class NotesPopup {
  private saveButton: HTMLElement

  constructor() {
    const saveButton = document.getElementById('saveButton')
    if (saveButton === null) {
      throw new Error('saveButton not found')
    }
    saveButton!.addEventListener('click', this.save.bind(this))
    this.set.bind(this)().catch(console.error)
    this.saveButton = saveButton
  }

  _autoExpandTextarea(event: Event) {
    const target = event.target as HTMLTextAreaElement
    target.style.height = 'auto'
    target.style.height = (target.scrollHeight) + 'px'
  }

  async resizeInput() {
    const storyNotesInput = this.getInput()
    storyNotesInput.addEventListener('input', this._autoExpandTextarea)
  }

  async save() {
    const storyId = await Story.id()
    if (!storyId) {
      throw new Error('Story ID not found')
    }
    const data = {[this.getKey(storyId)]: this.getInput().value}
    await chrome.storage.sync.set(data)
    this.saveButton.textContent = 'Saved!'
    const TWO_SECONDS = 2000
    await sleep(TWO_SECONDS)
    this.saveButton.textContent = 'Save'
  }

  getInput() {
    return document.getElementById('storyNotes') as HTMLInputElement
  }

  getKey(storyId: string) {
    return 'notes_' + storyId
  }

  async set() {
    this.resizeInput().catch(console.error)
    const storyId = await Story.id()
    if (!storyId) {
      throw new Error('Story ID not found')
    }
    const key = this.getKey(storyId)
    const storyNotesInput: HTMLInputElement | null = this.getInput()
    const result = await chrome.storage.sync.get(key)
    const value = result[key]
    if (storyNotesInput === null) {
      throw new Error('storyNotesInput not found')
    }
    if (value !== undefined) {
      storyNotesInput.value = value
    }
  }

  static async handleMessage(message: Record<string, string>) {
    if (message.message === 'checkNotes') {
      new NotesPopup()
    }
  }
}


chrome.runtime.onMessage.addListener(NotesPopup.handleMessage)
