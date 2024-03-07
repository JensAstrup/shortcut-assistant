import {captureException} from '@sentry/browser'
import {findFirstMatchingElementForState} from '../developmentTime/findFirstMatchingElementForState'
import {hoursBetweenExcludingWeekends} from './hoursBetweenExcludingWeekends'
import {Story} from './story'


const mockNow = {
  format: jest.fn().mockReturnValueOnce('Feb 1 2022, 2:00 AM')
}
jest.mock('dayjs', () => {
  return () => (mockNow)
})
jest.mock('@sentry/browser', () => ({
  captureException: jest.fn()
}))
jest.mock('./hoursBetweenExcludingWeekends', () => ({
  hoursBetweenExcludingWeekends: jest.fn().mockReturnValue(24)
}))
jest.mock('../developmentTime/findFirstMatchingElementForState', () => ({
  findFirstMatchingElementForState: jest.fn()
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

  it('returns the difference between now and the date in state', () => {
    const getDateInState = jest.fn()
    const dateElement = document.querySelector('.latest-update .element .date')
    getDateInState.mockReturnValueOnce(dateElement.innerHTML)
    const state = 'ExpectedState'
    const result = Story.getTimeInState(state, true)
    expect(mockNow.format).toHaveBeenCalledWith('MMM D YYYY, h:mm A')
    expect(result).toBe(24)
  })

  it('Uses date in state if now is false', () => {
    const state = 'ExpectedState'

    const getDateInState = jest.spyOn(Story, 'getDateInState')
    getDateInState.mockReturnValueOnce('Jan 31 2022, 2:00 AM')
    hoursBetweenExcludingWeekends.mockReturnValueOnce(48)
    const result = Story.getTimeInState(state, false)
    expect(result).toBe(48)
    expect(getDateInState).toHaveBeenCalledWith(state)
    expect(hoursBetweenExcludingWeekends).toHaveBeenCalledWith('Jan 31 2022, 2:00 AM')
  })

  it('Uses date in state if now is not provided', () => {
    const state = 'ExpectedState'

    const getDateInState = jest.spyOn(Story, 'getDateInState')
    getDateInState.mockReturnValueOnce('Jan 31 2022, 2:00 AM')
    hoursBetweenExcludingWeekends.mockReturnValueOnce(48)
    const result = Story.getTimeInState(state)
    expect(result).toBe(48)
    expect(getDateInState).toHaveBeenCalledWith(state)
    expect(hoursBetweenExcludingWeekends).toHaveBeenCalledWith('Jan 31 2022, 2:00 AM')
  })

  it('Returns 0 if date element is null', () => {
    console.warn = jest.fn()
    const state = 'ExpectedState'
    const getDateInState = jest.spyOn(Story, 'getDateInState')
    getDateInState.mockReturnValueOnce(null)
    const result = Story.getTimeInState(state, false)
    expect(result).toBe(0)
    expect(console.warn).toHaveBeenCalledWith('Could not find date element for state ExpectedState')
  })

  it('Returns 0 if date element is undefined', () => {
    console.warn = jest.fn()
    const state = 'ExpectedState'
    const getDateInState = jest.spyOn(Story, 'getDateInState')
    getDateInState.mockReturnValueOnce(undefined)
    const result = Story.getTimeInState(state, false)
    expect(result).toBe(0)
    expect(console.warn).toHaveBeenCalledWith('Could not find date element for state ExpectedState')
  })
})


describe('Story.getDateInState', () => {
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

    const result = Story.getDateInState('ExpectedState')
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
