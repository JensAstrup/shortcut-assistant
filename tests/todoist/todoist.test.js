import {Todoist} from '../../src/js/todoist/todoist'
import {Story} from '../../src/js/utils/story'


jest.mock('../../src/js/utils/log-error')
jest.mock('../../src/js/utils/story', () => ({
  Story: {
    title: 'Mocked Story Title',
    getEditDescriptionButtonContainer: jest.fn().mockResolvedValue({appendChild: jest.fn()})
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
      new Todoist()
      expect(window.open).not.toHaveBeenCalled()
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
      const todoist = new Todoist()
      const button = document.createElement('button')
      await todoist.addButtonIfNotExists('Test title', button)
      expect(Story.getEditDescriptionButtonContainer).toHaveBeenCalled()
    })

    it('does not append new button if it already exists', async () => {
      document.querySelector.mockReturnValue(document.createElement('button'))
      const todoist = new Todoist()
      const button = document.createElement('button')
      await todoist.addButtonIfNotExists('Test title', button)
      expect(Story.getEditDescriptionButtonContainer).not.toHaveBeenCalled()
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
      expect(Story.getEditDescriptionButtonContainer).not.toHaveBeenCalled()
    })
  })
})
