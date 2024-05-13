import {Todoist} from '@sx/todoist/todoist'
import {Story} from '@sx/utils/story'


jest.mock('@sx/utils/log-error')
jest.mock('@sx/utils/sleep', () => jest.fn().mockResolvedValue(null))

describe('Todoist', () => {
  beforeAll(() => {
    document.createElement = jest.fn().mockImplementation(tag => {
      return {
        appendChild: jest.fn(),
        setAttribute: jest.fn(),
        addEventListener: jest.fn(),
        tagName: tag.toUpperCase(),
        append: jest.fn(),
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
          append: jest.fn(),
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
      jest.spyOn(Story, 'title', 'get').mockReturnValue('Mocked Story Title')
      const tooltipText = Todoist.createTooltipText(null, 'Test title')
      expect(tooltipText).toBe('Test title [Mocked Story Title](https://example.com/story)')
    })

    it('returns tooltip text with taskTitle when defined', () => {
      jest.spyOn(Story, 'title', 'get').mockReturnValue('Mocked Story Title')
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

  describe('setTaskButton', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('should set a task button', async () => {
      const addButton = jest.spyOn(Story.prototype, 'addButton').mockResolvedValue()
      await Todoist.setTaskButton('Test title', 'Test tooltip')
      expect(addButton).toHaveBeenCalled()
    })
  })

  describe('setTaskButtons', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('should return if button exists', async () => {
      const addButton = jest.spyOn(Story.prototype, 'addButton').mockResolvedValue()
      jest.spyOn(Todoist, 'buttonExists').mockReturnValue({value: 'test'} as unknown as HTMLElement)
      await Todoist.setTaskButtons()
      expect(addButton).not.toHaveBeenCalled()
    })

    it('should set task buttons if in story page', async () => {
      jest.spyOn(Todoist, 'buttonExists').mockReturnValue(null)
      jest.spyOn(Todoist, 'setTaskButton').mockResolvedValue()
      await Todoist.setTaskButtons()
      expect(Todoist.setTaskButton).toHaveBeenCalledTimes(3)
    })
  })
})
