/**
 * @jest-environment jsdom
 */
import {Notes} from './notes' // Adjust the import path as necessary
import * as utils from '../utils/utils' // Import the module to mock its functions

// Mock the chrome.runtime.sendMessage
global.chrome = {
  runtime: {
    sendMessage: jest.fn()
  }
}

// Mock utils functions
jest.mock('../utils/utils', () => ({
  getDescriptionButtonContainer: jest.fn(),
  logError: jest.fn()
}))

describe('Notes class', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    // Setup default mocks
    utils.getDescriptionButtonContainer.mockResolvedValue(document.createElement('div'))
    chrome.runtime.sendMessage.mockResolvedValue({data: 'Mocked Data'})
    const originalLocation = window.location
    delete window.location
    window.location = {...originalLocation, href: 'http://app.shortcut.com/story'}

  })

  describe('constructor', () => {
    it('should call setContentIfDataExists if the URL includes "story"', () => {
      const mockSetContentIfDataExists = jest.spyOn(Notes.prototype, 'setContentIfDataExists').mockResolvedValue(null)
      window.location.href = 'https://app.shortcut.com/story/12345'
      new Notes()
      expect(mockSetContentIfDataExists).toHaveBeenCalled()
      mockSetContentIfDataExists.mockRestore()
    })

    it('should not call setContentIfDataExists if the URL does not include "story"', () => {
      const mockSetContentIfDataExists = jest.spyOn(Notes.prototype, 'setContentIfDataExists').mockResolvedValue(null)
      window.location.href = 'https://app.shortcut.com/other'
      new Notes()
      expect(mockSetContentIfDataExists).not.toHaveBeenCalled()
      mockSetContentIfDataExists.mockRestore()
    })
  })

  describe('setContentExistsNotice', () => {
    it('should append a new button if it does not exist', async () => {
      const container = document.createElement('div')
      utils.getDescriptionButtonContainer.mockResolvedValue(container)

      const notes = new Notes()
      await notes.setContentExistsNotice()

      expect(container.querySelector('.action.edit-description.view-notes.micro.flat-white')).not.toBeNull()
      expect(container.children.length).toBe(1) // Only one button should be added
    })

    it('should not append a new button if it already exists', async () => {
      const container = document.createElement('div')
      const button = document.createElement('button')
      button.className = 'action edit-description view-notes micro flat-white'
      container.appendChild(button)
      utils.getDescriptionButtonContainer.mockResolvedValue(container)

      const notes = new Notes()
      await notes.setContentExistsNotice()

      expect(container.children.length).toBe(1) // No new button should be added
    })
  })

  describe('remove', () => {
    it('should remove the button if it exists', () => {
      document.body.innerHTML = '<div><button class="view-notes"></button></div>'
      const notes = new Notes()
      notes.remove()

      expect(document.querySelector('.view-notes')).toBeNull()
    })
  })

  describe('setContentIfDataExists', () => {
    it('should remove the notes button if no data is provided and none is found', async () => {
      chrome.runtime.sendMessage.mockResolvedValue({}) // No data found
      document.body.innerHTML = '<div><button class="view-notes"></button></div>'

      const notes = new Notes()
      await notes.setContentIfDataExists()

      expect(document.querySelector('.view-notes')).toBeNull()
    })

    it('should call setContentExistsNotice if data exists', async () => {
      const mockSetContentExistsNotice = jest.spyOn(Notes.prototype, 'setContentExistsNotice').mockImplementation(async () => {
      })
      const notes = new Notes()
      await notes.setContentIfDataExists('Existing Data')

      expect(mockSetContentExistsNotice).toHaveBeenCalled()
      mockSetContentExistsNotice.mockRestore()
    })
  })

  // Additional tests can be added as needed
})
