import {findFirstMatchingElementForState} from '../developmentTime/findFirstMatchingElementForState'
import {hoursBetweenExcludingWeekends} from './hoursBetweenExcludingWeekends'
import {Story} from './story'


const mockNow = {
  format: jest.fn().mockReturnValueOnce('Feb 1 2022, 2:00 AM')
}
jest.mock('dayjs', () => {
  return () => (mockNow)
})
jest.mock('./hoursBetweenExcludingWeekends', () => ({
  hoursBetweenExcludingWeekends: jest.fn().mockReturnValue(24)
}))
jest.mock('../developmentTime/findFirstMatchingElementForState', () => ({
  findFirstMatchingElementForState: jest.fn()
}))

describe('Story.title', () => {
  test('get title', () => {
    document.body.innerHTML = `<div class="story-name">Sample Title</div>`
    expect(Story.title).toEqual('Sample Title')
  })
})

describe('Story.description', () => {
  test('get description', () => {
    document.body.innerHTML = `<div data-key="description">Sample Description</div>`
    expect(Story.description).toEqual('Sample Description')
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
  test('Uses dayjs now if now is true', () => {
    const getDateInState = jest.fn()
    const dateElement = document.querySelector('.latest-update .element .date')
    getDateInState.mockReturnValueOnce(dateElement.innerHTML)
    const state = 'ExpectedState'
    const result = Story.getTimeInState(state, true)
    expect(mockNow.format).toHaveBeenCalledWith('MMM D YYYY, h:mm A')
    expect(result).toBe(24)
  })
  test('Uses date in state if now is false', () => {
    const state = 'ExpectedState'

    const getDateInState = jest.spyOn(Story, 'getDateInState')
    getDateInState.mockReturnValueOnce('Jan 31 2022, 2:00 AM')
    hoursBetweenExcludingWeekends.mockReturnValueOnce(48)
    const result = Story.getTimeInState(state, false)
    expect(result).toBe(48)
    expect(getDateInState).toHaveBeenCalledWith(state)
    expect(hoursBetweenExcludingWeekends).toHaveBeenCalledWith('Jan 31 2022, 2:00 AM')
  })
  test('Uses date in state if now is not provided', () => {
    const state = 'ExpectedState'

    const getDateInState = jest.spyOn(Story, 'getDateInState')
    getDateInState.mockReturnValueOnce('Jan 31 2022, 2:00 AM')
    hoursBetweenExcludingWeekends.mockReturnValueOnce(48)
    const result = Story.getTimeInState(state)
    expect(result).toBe(48)
    expect(getDateInState).toHaveBeenCalledWith(state)
    expect(hoursBetweenExcludingWeekends).toHaveBeenCalledWith('Jan 31 2022, 2:00 AM')
  })
  test('Returns 0 if date element is null', () => {
    console.warn = jest.fn()
    const state = 'ExpectedState'
    const getDateInState = jest.spyOn(Story, 'getDateInState')
    getDateInState.mockReturnValueOnce(null)
    const result = Story.getTimeInState(state, false)
    expect(result).toBe(0)
    expect(console.warn).toHaveBeenCalledWith('Could not find date element for state ExpectedState')
  })
})

describe('Story.getDateInState', () => {

  test('returns null when no elements match the state', () => {
    findFirstMatchingElementForState.mockReturnValueOnce(null)

    const result = Story.getDateInState('NonExistentState')
    expect(result).toBeNull()

  })
  test('returns the date when state matches and date element exists', () => {
    const latestUpdateElement = {
      parentElement: {
        querySelector: jest.fn().mockReturnValueOnce({innerHTML: '2022-03-01'})
      }
    }
    findFirstMatchingElementForState.mockReturnValueOnce({element: latestUpdateElement})

    const result = Story.getDateInState('ExpectedState')
    expect(result).toBe('2022-03-01')
  })

  test('returns null when state div and date element do not exist', () => {
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

  test('returns true if the state is same as the story state', () => {
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

  test('returns false if the state is not same as the story state', () => {
    const state = 'DifferentState'
    expect(Story.isInState(state)).toBe(false)
  })

  test('returns false if the story state cannot be found', () => {
    document.querySelector = jest.fn(() => null)
    const state = 'TestState'
    expect(Story.isInState(state)).toBe(false)
  })
})
