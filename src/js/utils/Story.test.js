import {findFirstMatchingElementForState} from '../developmentTime/findFirstMatchingElementForState'
import {hoursBetweenExcludingWeekends} from './hoursBetweenExcludingWeekends'
import {Story} from './story'
import moment from 'moment'


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

const mockNow = {
  format: jest.fn().mockReturnValueOnce('Feb 1 2022, 2:00 AM')
}
jest.mock('moment', () => {
  return () => (mockNow)
})
jest.mock('./hoursBetweenExcludingWeekends', () => ({
  hoursBetweenExcludingWeekends: jest.fn().mockReturnValue(24)
}))
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
  test('Uses moment now if now is true', () => {
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

    const getDateInCurrentState = jest.spyOn(Story, 'getDateInCurrentState')
    getDateInCurrentState.mockReturnValueOnce('Jan 31 2022, 2:00 AM')
    hoursBetweenExcludingWeekends.mockReturnValueOnce(48)
    const result = Story.getTimeInState(state, false)
    expect(result).toBe(48)
    expect(getDateInCurrentState).toHaveBeenCalledWith(state)
    expect(hoursBetweenExcludingWeekends).toHaveBeenCalledWith('Jan 31 2022, 2:00 AM')
  })
  test('Returns 0 if date element is null', () => {
    console.warn = jest.fn()
    const state = 'ExpectedState'
    const getDateInCurrentState = jest.spyOn(Story, 'getDateInCurrentState')
    getDateInCurrentState.mockReturnValueOnce(null)
    const result = Story.getTimeInState(state, false)
    expect(result).toBe(0)
    expect(console.warn).toHaveBeenCalledWith('Could not find date element for state ExpectedState')
  })
})

jest.mock('../developmentTime/findFirstMatchingElementForState', () => ({
  findFirstMatchingElementForState: jest.fn()
}))

describe('Story.getDateInCurrentState', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="story-state">
        <span class="value">ExpectedState</span>
      </div>
      <div class="latest-update">
        <div class="element">
          <div class="date">2022-01-01</div>
        </div>
      </div>
    `
    jest.clearAllMocks()
  })

  test('returns null when no elements match the state', () => {
    findFirstMatchingElementForState.mockReturnValueOnce(null)

    const result = Story.getDateInCurrentState('NonExistentState')
    expect(result).toBeNull()
  })

  test('returns null when state span text does not match provided state', () => {
    findFirstMatchingElementForState.mockReturnValueOnce({element: document.querySelector('.latest-update .element')})

    const result = Story.getDateInCurrentState('MismatchState')
    expect(result).toBeNull()
  })

  test('returns the date when state matches and date element exists', () => {
    const latestUpdateElement = document.querySelector('.latest-update .element')
    findFirstMatchingElementForState.mockReturnValueOnce({element: latestUpdateElement})

    const result = Story.getDateInCurrentState('ExpectedState')
    expect(result).toBe('2022-01-01')
  })

  afterAll(() => {
    jest.clearAllMocks()
  })
})


describe('isInState function', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="story-state">
        <span class="value">TestState</span>
      </div>
    `
  })

  test('returns true if the state is same as the story state', () => {
    const state = 'TestState'
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
