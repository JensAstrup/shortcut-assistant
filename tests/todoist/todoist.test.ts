import {Todoist} from '@sx/todoist/todoist'
import {Story} from '@sx/utils/story'

import Func = jest.Func


jest.mock('@sx/utils/log-error')
jest.mock('@sx/utils/story', () => ({
  Story: {
    title: 'Mocked Story Title',
    getEditDescriptionButtonContainer: jest.fn().mockResolvedValue({appendChild: jest.fn()})
  }
}))
jest.mock('@sx/utils/sleep', () => jest.fn().mockResolvedValue(null))

describe('Todoist', () => {
  beforeAll(() => {
    document.createElement = jest.fn().mockImplementation(tag => {
      return {
        appendChild: jest.fn(),
        setAttribute: jest.fn(),
        addEventListener: jest.fn(),
        tagName: tag.toUpperCase()
      }
    })
    document.querySelector = jest.fn()
    window.open = jest.fn()
  })

  beforeEach(() => {
    // @ts-expect-error Migrating from JS
    delete window.location
    // @ts-expect-error Migrating from JS
    window.location = {href: 'https://example.com/story'}
    jest.clearAllMocks()
  })

  describe('setTaskButtons', () => {
    it('should set task buttons if in story page', async () => {
      jest.spyOn(Todoist, 'setTaskButton').mockResolvedValue()
      await Todoist.setTaskButtons()
      expect(Todoist.setTaskButton).toHaveBeenCalledTimes(3)
    })
  })

  describe('createButton', () => {
    it('creates and returns a button with the correct attributes', () => {
      const mockButton = document.createElement = jest.fn().mockImplementation(tag => {
        return {
          appendChild: jest.fn(),
          setAttribute: jest.fn(),
          addEventListener: jest.fn(),
          dataset: {},
          tagName: tag.toUpperCase(),
          style: {}
        } as unknown as HTMLElement
      })
      document.querySelector = jest.fn().mockReturnValue(mockButton)
      const button = Todoist.createButton('Tooltip text', 'Title text')
      expect(button).toHaveProperty('tagName', 'BUTTON')
      expect(button.setAttribute).toHaveBeenCalledWith('data-todoist', 'true')
      expect(button.dataset.tooltip).toBe('Tooltip text')
    })
  })

  describe('createTooltipText', () => {
    it('returns tooltip text with title when taskTitle is undefined', () => {
      const tooltipText = Todoist.createTooltipText(null, 'Test title')
      expect(tooltipText).toBe('Test title [Mocked Story Title](https://example.com/story)')
    })

    it('returns tooltip text with taskTitle when defined', () => {
      const tooltipText = Todoist.createTooltipText('Task title', 'Test title')
      expect(tooltipText).toBe('Task title [Mocked Story Title](https://example.com/story)')
    })
  })

  describe('buttonExists', () => {
    it('returns false when no button exists', () => {
      document.querySelector = jest.fn()
      // @ts-expect-error Migrating from JS
      document.querySelector.mockReturnValue(null)
      expect(Todoist.buttonExists()).toBe(null)
    })

    it('returns true when a button exists', () => {
      // @ts-expect-error Migrating from JS
      document.querySelector.mockReturnValue(document.createElement('button'))
      expect(Todoist.buttonExists()).toBeTruthy()
    })
  })

  describe('addButtonIfNotExists', () => {
    it('appends new button if it does not exist', async () => {
      // @ts-expect-error Migrating from JS
      document.querySelector.mockReturnValue(null)
      const button = document.createElement('button')
      await Todoist.addButtonIfNotExists(button)
      expect(Story.getEditDescriptionButtonContainer).toHaveBeenCalled()
    })

    it('does not append new button if it already exists', async () => {
      // @ts-expect-error Migrating from JS
      document.querySelector.mockReturnValue(document.createElement('button'))
      const button = document.createElement('button')
      await Todoist.addButtonIfNotExists(button)
      expect(Story.getEditDescriptionButtonContainer).not.toHaveBeenCalled()
    })
  })

  describe('setTaskButton', () => {
    let capturedEventListener: Func
    it('calls addButtonIfNotExists if button exists', async () => {
      const element = {
        appendChild: jest.fn(),
        setAttribute: jest.fn(),
        addEventListener: jest.fn((event, handler) => {
          capturedEventListener = handler
        }),
        append: jest.fn(),
        dataset: {},
        tagname: 'tag',
        style: {}
      } as unknown as HTMLButtonElement
      jest.spyOn(Todoist, 'createButton').mockReturnValue(element)
      document.querySelector = jest.fn().mockReturnValue(null)
      window.open = jest.fn()
      await Todoist.setTaskButton('Test title', 'Tooltip', 'Task title')
      expect(document.querySelector).toHaveBeenCalled()
      expect(Story.getEditDescriptionButtonContainer).toHaveBeenCalled()
      expect(Todoist.createButton).toHaveBeenCalled()
      expect(element.addEventListener).toHaveBeenCalled()
      // Get the function passed to addEventListener
      capturedEventListener()
      expect(window.open).toHaveBeenCalledWith('https://todoist.com/add?content=Task title [Mocked Story Title](https://example.com/story)', '_blank')
    })

    it('should return if button exists', async () => {
      const mockButton = document.createElement = jest.fn().mockImplementation(tag => {
        const element = {
          appendChild: jest.fn(),
          setAttribute: jest.fn(),
          addEventListener: jest.fn(),
          append: jest.fn(),
          dataset: {},
          tagname: tag.toUpperCase(),
          style: {}
        } as unknown as HTMLElement
        return element
      })
      document.querySelector = jest.fn().mockReturnValue(mockButton)
      await Todoist.setTaskButton('Test title', 'Tooltip', 'Task title')
      expect(document.querySelector).toHaveBeenCalled()
      expect(Story.getEditDescriptionButtonContainer).not.toHaveBeenCalled()
    })

    it('does not call addButtonIfNotExists if button exists', async () => {
      const mockButton = document.createElement = jest.fn().mockImplementation(tag => {
        const element = {
          appendChild: jest.fn(),
          setAttribute: jest.fn(),
          addEventListener: jest.fn(),
          append: jest.fn(),
          dataset: {},
          tagname: tag.toUpperCase(),
          style: {}
        } as unknown as HTMLElement
        return element
      })
      document.querySelector = jest.fn().mockReturnValue(mockButton)
      await Todoist.setTaskButton('Test title', 'Tooltip', 'Task title')
      expect(document.querySelector).toHaveBeenCalled()
      expect(Story.getEditDescriptionButtonContainer).not.toHaveBeenCalled()
    })
  })
})
