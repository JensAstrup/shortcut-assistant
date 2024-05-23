import {
  findFirstMatchingElementForState
} from '@sx/development-time/find-first-matching-element-for-state'
import * as urlModule from '@sx/utils/get-active-tab-url'
import scope from '@sx/utils/sentry'
import {ShortcutWorkflowStates} from '@sx/utils/get-states'
import {Story} from '@sx/utils/story'
import Workspace from '@sx/workspace/workspace'


const mockNow = {
  format: jest.fn().mockReturnValueOnce('Feb 1 2022, 2:00 AM'),
  subtract: jest.fn().mockReturnValueOnce({format: jest.fn().mockReturnValueOnce('Jan 31 2022, 2:00 AM')}),
  isAfter: jest.fn().mockReturnValueOnce(true),
  add: jest.fn().mockReturnValueOnce({format: jest.fn().mockReturnValueOnce('Feb 2 2022, 2:00 AM')})
}
jest.mock('dayjs', () => {
  return () => (mockNow)
})
jest.mock('@sx/utils/sentry')
jest.mock('@sx/utils/hours-between-excluding-weekends', () => ({
  // eslint-disable-next-line no-magic-numbers
  hoursBetweenExcludingWeekends: jest.fn().mockReturnValue(24)
}))
jest.mock('@sx/development-time/find-first-matching-element-for-state', () => ({
  findFirstMatchingElementForState: jest.fn()
}))
jest.mock('@sx/utils/sleep', () => jest.fn().mockResolvedValue(undefined))
jest.mock('@sx/utils/get-active-tab-url', () => ({
  getActiveTabUrl: jest.fn()
}))
jest.spyOn(Workspace, 'states').mockImplementation(async (): Promise<ShortcutWorkflowStates | null> => {
  return {
    'Backlog': ['To Do'],
    'Unstarted': ['Waiting'],
    'Started': ['In Development'],
    'Done': []
  }
})

describe('Story.title', () => {
  it('should return story title when set', () => {
    document.body.innerHTML = '<div class="story-name">Sample Title</div>'
    expect(Story.title).toEqual('Sample Title')
  })

  it('should return empty string when title is not set', () => {
    document.body.innerHTML = '<div class="story-name"></div>'
    expect(Story.title).toBeNull()
  })

  it('should return empty string when title is not available', () => {
    document.body.innerHTML = '<div></div>'
    expect(Story.title).toBeNull()
  })
})


describe('Story.description', () => {
  it('should return story description when set', () => {
    document.body.innerHTML = '<div id="story-description-v2">Sample Description</div>'
    expect(Story.description).toEqual('Sample Description')
  })

  it('should return null when description is not set', () => {
    document.body.innerHTML = '<div id="story-description-v2"></div>'
    expect(Story.description).toBeNull()
  })

  it('should return null when description is not set', () => {
    document.body.innerHTML = '<div></div>'
    expect(Story.description).toBeNull()
  })
})

describe('getEditDescriptionButtonContainer', () => {
  // @ts-expect-error Remnants from before typescript implementation
  let originalQuerySelector

  beforeEach(() => {
    originalQuerySelector = document.querySelector

    document.querySelector = jest.fn()
  })

  afterEach(() => {
    // @ts-expect-error Remnants from before typescript implementation
    document.querySelector = originalQuerySelector
    jest.clearAllTimers()
  })

  it('should return the container immediately if the button is found', async () => {
    const mockContainer = document.createElement('div')
    // @ts-expect-error Remnants from before typescript implementation
    document.querySelector.mockReturnValue(mockContainer)

    const container = await Story.getEditDescriptionButtonContainer()

    expect(container).toBe(mockContainer)
    expect(document.querySelector).toHaveBeenCalledTimes(1)
  })


  it('should return null if the button is not found within the maximum number of attempts', async () => {
    // @ts-expect-error Remnants from before typescript implementation
    document.querySelector.mockReturnValue(null)

    const promise = Story.getEditDescriptionButtonContainer()

    const container = await promise

    expect(container).toBeNull()
    expect(document.querySelector).toHaveBeenCalledTimes(11)
  })
})


describe('Story.getTimeInState', () => {
  beforeEach(() => {
    document.body.innerHTML = `
        <div class="story-state">
          <span class="value">ExpectedState</span>
        </div>
        <div class="latest-update">
          <div class="element">
            <div class="date">Feb 2 2022, 2:00 AM</div>
          </div>
        </div>
      `
  })

  afterAll(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('returns the difference between now and the date in state', () => {
    jest.spyOn(Story, 'getDateInState').mockReturnValue('Feb 2 2022, 2:00 AM')
    const state = 'ExpectedState'
    const result = Story.getTimeInState(state)
    expect(mockNow.format).toHaveBeenCalledWith('MMM D YYYY, h:mm A')
    expect(result).toBe(24)
  })

  it('returns the difference between now and the date in state', () => {
    jest.spyOn(Story, 'getDateInState').mockReturnValue(null)
    const result = Story.getTimeInState('13')
    expect(mockNow.format).toHaveBeenCalledWith('MMM D YYYY, h:mm A')
    expect(result).toBeNull()
  })
})


describe('Story.getDateInState', () => {
  beforeEach(() => {
    document.body.innerHTML = `
          <div id="story-dialog-state-dropdown"><span class="value">In Development</span></div>
        `
    jest.clearAllMocks()
  })

  it('returns null when no elements match the state', () => {
    // @ts-expect-error Remnants from before typescript implementation
    findFirstMatchingElementForState.mockReturnValueOnce(null)

    const result = Story.getDateInState('NonExistentState')
    expect(result).toBeNull()

  })

  it('returns the date when state matches and date element exists', () => {
    const latestUpdateElement = {
      parentElement: {
        querySelector: jest.fn().mockReturnValueOnce({innerHTML: '2022-03-01'})
      }
    }
    // @ts-expect-error Remnants from before typescript implementation
    findFirstMatchingElementForState.mockReturnValueOnce({element: latestUpdateElement})

    const result = Story.getDateInState('ExpectedState2')
    expect(result).toBe('2022-03-01')
  })

  it('returns null when state div and date element do not exist', () => {
    // @ts-expect-error Remnants from before typescript implementation
    findFirstMatchingElementForState.mockReturnValueOnce({element: {parentElement: {querySelector: jest.fn().mockReturnValueOnce(null)}}})
    const result = Story.getDateInState('ExpectedState')
    expect(result).toBeNull()
  })
})

describe('Story.state', () => {
  it('should return story state when set', () => {
    document.body.innerHTML = '<div id="story-dialog-state-dropdown"><span class="value">In Development</span></div>'
    expect(Story.state?.innerHTML).toEqual('In Development')
  })

  it('should return null when state is not set', () => {
    document.body.innerHTML = '<div id="story-dialog"></div>'
    expect(Story.state).toBeNull()
  })
})


describe('isCompleted', () => {
  beforeEach(() => {
    jest.spyOn(Workspace, 'states').mockImplementation(async (): Promise<ShortcutWorkflowStates | null> => {
      return {
        'Backlog': ['To Do'],
        'Unstarted': ['Waiting'],
        'Started': ['In Development'],
        'Done': ['Done']
      }
    })
  })
  it('should return true if the story is in a done state', async () => {
    jest.spyOn(Story, 'state', 'get').mockReturnValue({textContent: 'Done'} as unknown as HTMLElement)
    const result = await Story.isCompleted()
    expect(result).toBe(true)
  })

  it('should return false if the story is not in a done state', async () => {
    jest.spyOn(Story, 'state', 'get').mockReturnValue({textContent: 'In Development'} as unknown as HTMLElement)
    const result = await Story.isCompleted()
    expect(result).toBe(false)
  })
})


describe('isInState function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = '<div id="story-dialog-state-dropdown"><span class="value">In Development</span></div>'
    jest.spyOn(Workspace, 'states').mockImplementation(async (): Promise<ShortcutWorkflowStates | null> => {
      return {
        'Backlog': ['To Do'],
        'Unstarted': ['Waiting'],
        'Started': ['In Development'],
        'Done': []
      }
    })
  })

  it('returns true if the state is same as the story state', async () => {
    const state = 'In Development'
    document.getElementById = jest.fn(() => {
      return {
        querySelector: jest.fn(() => {
          return {textContent: state}
        })
      } as unknown as HTMLElement
    })
    expect(await Story.isInState('Started')).toBe(true)
  })

  it('returns true if the state is found within the story state', async () => {
    document.getElementById = jest.fn(() => {
      return {
        querySelector: jest.fn(() => {
          return {textContent: 'TestState, In Development'}
        })
      } as unknown as HTMLElement
    })
    expect(await Story.isInState('Started')).toBe(true)
  })

  it('returns false if the state does not have a value', async () => {
    const state = 'TestState'
    document.getElementById = jest.fn(() => {
      return {
        querySelector: jest.fn(() => {
          return null
        })
      } as unknown as HTMLElement
    })
    expect(await Story.isInState('Started')).toBe(false)
  })

  it('returns false if the state is different from the story state', async () => {
    expect(await Story.isInState('Started')).toBe(false)
  })

  it('returns false if the state is not found', async () => {
    document.getElementById = jest.fn(() => null)
    expect(await Story.isInState('Started')).toBe(false)
  })

  it('logs a warning if the state is not found', () => {
    console.warn = jest.fn()
    document.getElementById = jest.fn().mockImplementation(() => {
      throw new Error('Could not find state element for state TestState')
    })
    Story.isInState('Started')
    expect(console.warn).toHaveBeenCalledWith('Could not find state element for state Started')
    expect(scope.captureException).toHaveBeenCalledWith(new Error('Could not find state element for state TestState'))
  })
})

describe('Story.notes', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should return story notes when set', () => {
    jest.spyOn(Story, 'id').mockResolvedValue('123')
    // @ts-expect-error Remnants from before typescript implementation
    chrome.storage.sync.get.mockResolvedValue({notes_123: 'Test note'})
    expect(Story.notes()).resolves.toBe('Test note')
  })

  it('should return null when notes are not set', () => {
    jest.spyOn(Story, 'id').mockResolvedValue('123')
    // @ts-expect-error Remnants from before typescript implementation
    chrome.storage.sync.get.mockResolvedValue({})
    expect(Story.notes()).resolves.toBeNull()
  })

  it('should return null when story ID is not set', () => {
    jest.spyOn(Story, 'id').mockResolvedValue(null)
    expect(Story.notes()).resolves.toBeNull()
  })
})

describe('Story id', () => {
  it('returns the correct story ID from a valid URL', async () => {
    // @ts-expect-error Remnants from before typescript implementation
    urlModule.getActiveTabUrl.mockResolvedValue('https://app.shortcut.com/story/12345')
    await expect(Story.id()).resolves.toBe('12345')
  })

  it('returns null if the URL does not contain a story ID', async () => {
    // @ts-expect-error Remnants from before typescript implementation
    urlModule.getActiveTabUrl.mockResolvedValue('https://app.shortcut.com/profile')
    await expect(Story.id()).resolves.toBeNull()
  })

  it('handles URLs with additional path segments correctly', async () => {
    // @ts-expect-error Remnants from before typescript implementation
    urlModule.getActiveTabUrl.mockResolvedValue('https://app.shortcut.com/story/12345/details')
    await expect(Story.id()).resolves.toBe('12345')
  })

  it('returns null if getActiveTabUrl rejects', async () => {
    // @ts-expect-error Remnants from before typescript implementation
    urlModule.getActiveTabUrl.mockRejectedValue(new Error('Error fetching URL'))
    await expect(Story.id()).rejects.toThrow('Error fetching URL')
  })
})

describe('Story addButton', () => {
  it('should add a button to the container', async () => {
    const button = document.createElement('button')
    const container = document.createElement('div')
    jest.spyOn(Story, 'getEditDescriptionButtonContainer').mockResolvedValue(container)
    const story = new Story()
    await story.addButton(button, 'test')
    expect(container.children).toContain(button)
  })

  it('should not add a button if it already exists', async () => {
    const button = document.createElement('button')
    const container = document.createElement('div')
    container.appendChild(button)
    jest.spyOn(Story, 'getEditDescriptionButtonContainer').mockResolvedValue(container)
    const story = new Story()
    await story.addButton(button, 'test')
    expect(container.children.length).toBe(1)
  })
})
