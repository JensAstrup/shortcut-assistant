import {getStoryId} from '../utils/getStoryId'
import {sleep} from '../utils/utils'


export class NotesPopup {
  constructor() {
    const notesSaveButton = document.getElementById('saveButton')
    notesSaveButton.addEventListener('click', this.save.bind(this))

    this.set().catch(console.error)
  }

  async resizeInput() {
    try {
      const storyNotesInput = this.getInput()

      function autoExpandTextarea() {
        this.style.height = 'auto'
        this.style.height = (this.scrollHeight) + 'px'
      }

      storyNotesInput.addEventListener('input', autoExpandTextarea)

    } catch {
      return
    }

    await this.set()
  }

  async save() {
    const notesSaveButton = document.getElementById('saveButton')
    const data = {[this.getKey(await getStoryId())]: this.getInput().value}
    await chrome.storage.sync.set(data)
    notesSaveButton.textContent = 'Saved!'
    await sleep(2000)
    notesSaveButton.textContent = 'Save'
  }

  getInput() {
    return document.getElementById('storyNotes')
  }

  getKey(storyId) {
    return 'notes_' + storyId
  }

  async set() {
    this.resizeInput().catch(console.error)
    const key = this.getKey(await getStoryId())
    const storyNotesInput = this.getInput()
    const result = await chrome.storage.sync.get(key)
    const value = result[key]
    if (value !== undefined) {
      storyNotesInput.value = value
    }
  }
}


chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.message === 'checkNotes') {
    new NotesPopup()
  }
})
