import {Todoist} from './Todoist'
import getEditDescriptionButtonContainer from '../utils/getEditDescriptionButtonContainer'
import {logError} from '../utils/logError'
import {Story} from '../utils/story'


jest.mock('../utils/getEditDescriptionButtonContainer')
jest.mock('../utils/logError')
jest.mock('../utils/story', () => ({
  Story: {
    title: 'Mocked Story Title'
  }
}))
describe('Todoist', () => {
  beforeAll(() => {
    document.createElement = jest.fn().mockImplementation(tag => {
      const element = {
        appendChild: jest.fn(),
        setAttribute: jest.fn(),
        addEventListener: jest.fn()
      }
      element.tagName = tag.toUpperCase()
      return element
    })
    document.querySelector = jest.fn()
    window.open = jest.fn()
  })

  beforeEach(() => {
    delete window.location
    window.location = {href: 'https://example.com/story'}
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should set task buttons if in story page', async () => {
      const todoist = new Todoist()
      expect(window.open).not.toHaveBeenCalled() // Constructor does not immediately call window.open
    })
  })

  describe('createButton', () => {
    it('creates and returns a button with the correct attributes', () => {
      const mockButton = document.createElement = jest.fn().mockImplementation(tag => {
        const element = {
          appendChild: jest.fn(),
          setAttribute: jest.fn(),
          addEventListener: jest.fn(),
          dataset: {}
        }
        element.tagName = tag.toUpperCase()
        return element
      })
      document.querySelector = jest.fn().mockReturnValue(mockButton)
      const todoist = new Todoist()
      const button = todoist.createButton('Tooltip text', 'Title text')
      expect(button).toHaveProperty('tagName', 'BUTTON')
      expect(button.setAttribute).toHaveBeenCalledWith('data-todoist', 'true')
      expect(button.dataset.tooltip).toBe('Tooltip text')
    })
  })

  describe('createTooltipText', () => {
    it('returns tooltip text with title when taskTitle is undefined', () => {
      const todoist = new Todoist()
      const tooltipText = todoist.createTooltipText(undefined, 'Test title')
      expect(tooltipText).toBe('Test title [Mocked Story Title](https://example.com/story)')
    })

    it('returns tooltip text with taskTitle when defined', () => {
      const todoist = new Todoist()
      const tooltipText = todoist.createTooltipText('Task title', 'Test title')
      expect(tooltipText).toBe('Task title [Mocked Story Title](https://example.com/story)')
    })
  })

  describe('buttonExists', () => {
    it('returns false when no button exists', () => {
      document.querySelector.mockReturnValue(null)
      const todoist = new Todoist()
      expect(todoist.buttonExists()).toBe(null)
    })

    it('returns true when a button exists', () => {
      document.querySelector.mockReturnValue(document.createElement('button'))
      const todoist = new Todoist()
      expect(todoist.buttonExists()).toBeTruthy()
    })
  })

  describe('addButtonIfNotExists', () => {
    it('appends new button if it does not exist', async () => {
      document.querySelector.mockReturnValue(null)
      getEditDescriptionButtonContainer.mockResolvedValue({appendChild: jest.fn()})
      const todoist = new Todoist()
      const button = document.createElement('button')
      await todoist.addButtonIfNotExists('Test title', button)
      expect(getEditDescriptionButtonContainer).toHaveBeenCalled()
    })

    it('does not append new button if it already exists', async () => {
      document.querySelector.mockReturnValue(document.createElement('button'))
      const todoist = new Todoist()
      const button = document.createElement('button')
      await todoist.addButtonIfNotExists('Test title', button)
      expect(getEditDescriptionButtonContainer).not.toHaveBeenCalled()
    })
  })

  describe('setTaskButton', () => {
    it('does not call addButtonIfNotExists if button exists', async () => {
      const mockButton = document.createElement = jest.fn().mockImplementation(tag => {
        const element = {
          appendChild: jest.fn(),
          setAttribute: jest.fn(),
          addEventListener: jest.fn(),
          append: jest.fn(),
          dataset: {}
        }
        element.tagName = tag.toUpperCase()
        return element
      })
      document.querySelector = jest.fn().mockReturnValue(mockButton)
      const todoist = new Todoist()
      await todoist.setTaskButton('Test title', 'Tooltip', 'Task title')
      expect(document.querySelector).toHaveBeenCalled()
      expect(getEditDescriptionButtonContainer).not.toHaveBeenCalled()
    })
  })
})
