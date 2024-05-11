import {CycleTime} from '@sx/cycle-time/cycle-time'
import {hoursBetweenExcludingWeekends} from '@sx/utils/hours-between-excluding-weekends'
import {Story} from '@sx/utils/story'
import storyPageIsReady from '@sx/utils/story-page-is-ready'


jest.mock('@sx/utils/hours-between-excluding-weekends', () => ({
  hoursBetweenExcludingWeekends: jest.fn()
}))
const mockedHoursBetweenExcludingWeekends = hoursBetweenExcludingWeekends as jest.MockedFunction<typeof hoursBetweenExcludingWeekends>
jest.mock('@sx/utils/story-page-is-ready', () => jest.fn())
const mockedStoryPageIsReady = storyPageIsReady as jest.MockedFunction<typeof storyPageIsReady>
jest.mock('@sx/utils/story', () => ({
  Story: {
    isInState: jest.fn(),
    getDateInState: jest.fn()
  }
}))
const mockedStory = Story as jest.Mocked<typeof Story>

global.chrome.storage.sync = {get: jest.fn()} as unknown as jest.Mocked<typeof chrome.storage.sync>
// @ts-expect-error - TS doesn't know about the mock implementation
global.chrome.storage.sync.get.mockImplementation((key, callback) => {
  const data = {doneText: 'Completed'}
  if (typeof callback === 'function') {
    callback(data)
  }
  return data
})

describe('set function', () => {
  let createdDiv: HTMLElement, completedDiv: HTMLElement, storyCreatedDivParent: HTMLElement

  beforeEach(() => {
    mockedStoryPageIsReady.mockClear()
    document.querySelector = jest.fn().mockImplementation(selector => {
      if (selector === '.story-date-cycle-time') return null // simulate absence initially
      if (selector === '.story-date-created') return createdDiv
      if (selector === '.story-date-completed') return completedDiv
    })
    document.createElement = jest.fn().mockImplementation(() => {
      return {
        style: {},
        className: '',
        innerHTML: ''
      }
    })

    // Setup DOM elements mock
    createdDiv = {
      // @ts-expect-error - Migrating from JS
      parentElement: {
        insertBefore: jest.fn()
      }
    }
    // @ts-expect-error - Migrating from JS
    completedDiv = {
      querySelector: jest.fn().mockReturnValue({innerHTML: '2022-09-23'})
    }
    // @ts-expect-error - Migrating from JS
    storyCreatedDivParent = createdDiv.parentElement
  })

  it('should not display cycle time when the story is not completed', async () => {
    mockedStory.isInState.mockReturnValue(false)

    await CycleTime.set()

    expect(storyPageIsReady).toHaveBeenCalledTimes(1)
    expect(mockedStory.isInState).toHaveBeenCalledWith('Completed')
    expect(storyCreatedDivParent.insertBefore).not.toHaveBeenCalled()
  })

  it('should log an error if there is no created date', async () => {
    mockedStory.isInState.mockReturnValue(true)
    document.querySelector = jest.fn().mockImplementation(selector => {
      if (selector === '.story-date-cycle-time') return null // simulate absence initially
      if (selector === '.story-date-created') return null
      if (selector === '.story-date-completed') return completedDiv
    })
    console.error = jest.fn()
    await CycleTime.set()
    expect(console.error).toHaveBeenCalledWith('Could not find created date')
  })

  it('should log an error if there is no in development date', async () => {
    mockedStory.isInState.mockReturnValue(true)
    document.querySelector = jest.fn().mockImplementation(selector => {
      if (selector === '.story-date-cycle-time') return null // simulate absence initially
      if (selector === '.story-date-created') return createdDiv
      if (selector === '.story-date-completed') return null
    })
    console.error = jest.fn()
    await CycleTime.set()
    expect(console.error).toHaveBeenCalledWith('Could not find completed date')
  })

  it('should not display cycle time when the cycle time is not a number', async () => {
    mockedStory.isInState.mockReturnValue(true)
    mockedStory.getDateInState.mockReturnValue('2022-08-23')
    mockedHoursBetweenExcludingWeekends.mockReturnValue(NaN) // Simulate NaN

    await CycleTime.set()

    expect(storyPageIsReady).toHaveBeenCalledTimes(1)
    expect(mockedStory.isInState).toHaveBeenCalledWith('Completed')
    expect(mockedStory.getDateInState).toHaveBeenCalledWith('In Development')
    expect(mockedHoursBetweenExcludingWeekends).toHaveBeenCalledWith('2022-08-23', '2022-09-23')
    expect(document.createElement).toHaveBeenCalledWith('div')
    expect(storyCreatedDivParent.insertBefore).not.toHaveBeenCalled()
  })

  it('should calculate and display cycle time when the story is completed', async () => {
    mockedStory.isInState.mockReturnValue(true)
    mockedStory.getDateInState.mockReturnValue('2022-08-23')
    mockedHoursBetweenExcludingWeekends.mockReturnValue(48) // Simulate 48 hours difference

    await CycleTime.set()

    expect(storyPageIsReady).toHaveBeenCalledTimes(1)
    expect(mockedStory.isInState).toHaveBeenCalledWith('Completed')
    expect(mockedStory.getDateInState).toHaveBeenCalledWith('In Development')
    expect(mockedHoursBetweenExcludingWeekends).toHaveBeenCalledWith('2022-08-23', '2022-09-23')
    expect(document.createElement).toHaveBeenCalledWith('div')
    expect(storyCreatedDivParent.insertBefore).toHaveBeenCalledTimes(1) // Ensure the div was inserted
  })
})

describe('clear function', () => {
  it('should remove cycleTimeDiv from the document if it exists', () => {
    document.body.innerHTML = '<div class="story-date-cycle-time"></div>'

    CycleTime.clear()

    const cycleTimeDiv = document.querySelector('.story-date-cycle-time')
    expect(cycleTimeDiv).toBeNull()
  })

  it('should not throw an error if cycleTimeDiv does not exist in the document', () => {
    document.body.innerHTML = ''

    expect(CycleTime.clear).not.toThrow()
  })
})