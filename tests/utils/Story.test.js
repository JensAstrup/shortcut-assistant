import {captureException} from '@sentry/browser'

import {
  findFirstMatchingElementForState
} from '../../src/js/developmentTime/findFirstMatchingElementForState'

import * as urlModule from '../../src/js/utils/getActiveTabUrl'
import {Story} from '../../src/js/utils/story'


const mockNow = {
  format: jest.fn().mockReturnValueOnce('Feb 1 2022, 2:00 AM')
}
jest.mock('dayjs', () => {
  return () => (mockNow)
})
jest.mock('@sentry/browser', () => ({
  captureException: jest.fn()
}))
jest.mock('../../src/js/utils/hoursBetweenExcludingWeekends', () => ({
  hoursBetweenExcludingWeekends: jest.fn().mockReturnValue(24)
}))
jest.mock('../../src/js/developmentTime/findFirstMatchingElementForState', () => ({
  findFirstMatchingElementForState: jest.fn()
}))
jest.mock('../../src/js/utils/sleep', () => jest.fn().mockResolvedValue(undefined))
jest.mock('../../src/js/utils/getActiveTabUrl', () => ({
  getActiveTabUrl: jest.fn()
}))


describe('Story.title', () => {
  it('should return story title when set', () => {
    document.body.innerHTML = `<div class="story-name">Sample Title</div>`
    expect(Story.title).toEqual('Sample Title')
  })

  it('should return empty string when title is not set', () => {
    document.body.innerHTML = `<div class="story-name"></div>`
    expect(Story.title).toBeNull()
  })

  it('should return empty string when title is not available', () => {
    document.body.innerHTML = `<div></div>`
    expect(Story.title).toBeNull()
  })
})


describe('Story.description', () => {
  it('should return story description when set', () => {
    document.body.innerHTML = `<div data-key="description">Sample Description</div>`
    expect(Story.description).toEqual('Sample Description')
  })

  it('should return null when description is not set', () => {
    document.body.innerHTML = `<div data-key="description"></div>`
    expect(Story.description).toBeNull()
  })

  it('should return null when description is not set', () => {
    document.body.innerHTML = `<div></div>`
    expect(Story.description).toBeNull()
  })
})

describe('getEditDescriptionButtonContainer', () => {
  let originalQuerySelector

  beforeEach(() => {
    originalQuerySelector = document.querySelector

    document.querySelector = jest.fn()
  })

  afterEach(() => {
    document.querySelector = originalQuerySelector
    jest.clearAllTimers()
  })

  it('should return the container immediately if the button is found', async () => {
    const mockContainer = document.createElement('div')
    document.querySelector.mockReturnValue({parentElement: mockContainer})

    const container = await Story.getEditDescriptionButtonContainer()

    expect(container).toBe(mockContainer)
    expect(document.querySelector).toHaveBeenCalledTimes(1)
  })

  it('should return the container after a few attempts if the button initially does not exist', async () => {
    const mockContainer = document.createElement('div')
    document.querySelector
    .mockReturnValueOnce({parentElement: null}) // First call, button not found
    .mockReturnValueOnce({parentElement: null}) // Second call, button still not found
    .mockReturnValue({parentElement: mockContainer}) // Third call, button found

    const promise = Story.getEditDescriptionButtonContainer()

    const container = await promise

    expect(container).toBe(mockContainer)
    expect(document.querySelector).toHaveBeenCalledTimes(3)
  })

  it('should return null if the button is not found within the maximum number of attempts', async () => {
    document.querySelector.mockReturnValue({parentElement: null})

    const promise = Story.getEditDescriptionButtonContainer()

    const container = await promise

    expect(container).toBeNull()
    expect(document.querySelector).toHaveBeenCalledTimes(12)
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
            <div class="story-state">
            <span class="value">ExpectedState</span>
            </div>
        `
    jest.clearAllMocks()
  })

  it('returns null when no elements match the state', () => {
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
    findFirstMatchingElementForState.mockReturnValueOnce({element: latestUpdateElement})

    const result = Story.getDateInState('ExpectedState2')
    expect(result).toBe('2022-03-01')
  })

  it('returns null when state div and date element do not exist', () => {
    findFirstMatchingElementForState.mockReturnValueOnce({element: {parentElement: {querySelector: jest.fn().mockReturnValueOnce(null)}}})
    const result = Story.getDateInState('ExpectedState')
    expect(result).toBeNull()
  })
})


describe('isInState function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = `
      <div class="story-state">
        <span class="value">TestState</span>
      </div>
    `
  })

  it('returns true if the state is same as the story state', () => {
    const state = 'TestState'
    document.querySelector = jest.fn(() => {
      return {
        querySelector: jest.fn(() => {
          return {textContent: state}
        })
      }
    })
    expect(Story.isInState(state)).toBe(true)
  })

  it('returns true if the state is found within the story state', () => {
    const state = 'TestState'
    document.querySelector = jest.fn(() => {
      return {
        querySelector: jest.fn(() => {
          return {textContent: 'TestState, TestState2'}
        })
      }
    })
    expect(Story.isInState(state)).toBe(true)
  })

  it('returns false if the state does not have a value', () => {
    const state = 'TestState'
    document.querySelector = jest.fn(() => {
      return {
        querySelector: jest.fn(() => {
          return null
        })
      }
    })
    expect(Story.isInState(state)).toBe(false)
  })

  it('returns false if the state is different from the story state', () => {
    const state = 'DifferentState'
    expect(Story.isInState(state)).toBe(false)
  })

  it('returns false if the state is not found', () => {
    document.querySelector = jest.fn(() => null)
    const state = 'TestState'
    expect(Story.isInState(state)).toBe(false)
  })

  it('logs a warning if the state is not found', () => {
    console.warn = jest.fn()
    document.querySelector = jest.fn().mockImplementation(() => {
      throw new Error('Could not find state element for state TestState')
    })
    const state = 'TestState'
    Story.isInState(state)
    expect(console.warn).toHaveBeenCalledWith('Could not find state element for state TestState')
    expect(captureException).toHaveBeenCalledWith(new Error('Could not find state element for state TestState'))
  })
})

describe('Story.notes', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should return story notes when set', () => {
    jest.spyOn(Story, 'id').mockResolvedValue('123')
    chrome.storage.sync.get.mockResolvedValue({notes_123: 'Test note'})
    expect(Story.notes()).resolves.toBe('Test note')
  })

  it('should return null when notes are not set', () => {
    jest.spyOn(Story, 'id').mockResolvedValue('123')
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
    urlModule.getActiveTabUrl.mockResolvedValue('https://app.shortcut.com/story/12345')
    await expect(Story.id()).resolves.toBe('12345')
  })

  it('returns null if the URL does not contain a story ID', async () => {
    urlModule.getActiveTabUrl.mockResolvedValue('https://app.shortcut.com/profile')
    await expect(Story.id()).rejects.toThrow('Story ID not found')
  })

  it('handles URLs with additional path segments correctly', async () => {
    urlModule.getActiveTabUrl.mockResolvedValue('https://app.shortcut.com/story/12345/details')
    await expect(Story.id()).resolves.toBe('12345')
  })

  it('returns null if getActiveTabUrl rejects', async () => {
    urlModule.getActiveTabUrl.mockRejectedValue(new Error('Error fetching URL'))
    await expect(Story.id()).rejects.toThrow('Error fetching URL')
  })
})
