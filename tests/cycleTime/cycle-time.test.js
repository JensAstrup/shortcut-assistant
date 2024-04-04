import {CycleTime} from '../../src/js/cycle-time/cycle-time'
import {hoursBetweenExcludingWeekends} from '../../src/js/utils/hoursBetweenExcludingWeekends'
import {Story} from '../../src/js/utils/story'
import storyPageIsReady from '../../src/js/utils/storyPageIsReady'


jest.mock('../../src/js/utils/hoursBetweenExcludingWeekends', () => ({
  hoursBetweenExcludingWeekends: jest.fn()
}))
jest.mock('../../src/js/utils/storyPageIsReady', () => jest.fn())
jest.mock('../../src/js/utils/story', () => ({
  Story: {
    isInState: jest.fn(),
    getDateInState: jest.fn()
  }
}))



describe('set function', () => {
  let createdDiv, completedDiv, storyCreatedDivParent

  beforeEach(() => {
    storyPageIsReady.mockClear()
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
      parentElement: {
        insertBefore: jest.fn()
      }
    }
    completedDiv = {
      querySelector: jest.fn().mockReturnValue({innerHTML: '2022-09-23'})
    }
    storyCreatedDivParent = createdDiv.parentElement
  })

  it('should not display cycle time when the story is not completed', async () => {
    Story.isInState.mockReturnValue(false)

    await CycleTime.set()

    expect(storyPageIsReady).toHaveBeenCalledTimes(1)
    expect(Story.isInState).toHaveBeenCalledWith('Completed')
    expect(storyCreatedDivParent.insertBefore).not.toHaveBeenCalled()
  })

  it('should log an error if there is no created date', async () => {
    Story.isInState.mockReturnValue(true)
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
    Story.isInState.mockReturnValue(true)
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
    Story.isInState.mockReturnValue(true)
    Story.getDateInState.mockReturnValue('2022-08-23')
    hoursBetweenExcludingWeekends.mockReturnValue(NaN) // Simulate NaN

    await CycleTime.set()

    expect(storyPageIsReady).toHaveBeenCalledTimes(1)
    expect(Story.isInState).toHaveBeenCalledWith('Completed')
    expect(Story.getDateInState).toHaveBeenCalledWith('In Development')
    expect(hoursBetweenExcludingWeekends).toHaveBeenCalledWith('2022-08-23', '2022-09-23')
    expect(document.createElement).toHaveBeenCalledWith('div')
    expect(storyCreatedDivParent.insertBefore).not.toHaveBeenCalled()
  })

  it('should calculate and display cycle time when the story is completed', async () => {
    Story.isInState.mockReturnValue(true)
    Story.getDateInState.mockReturnValue('2022-08-23')
    hoursBetweenExcludingWeekends.mockReturnValue(48) // Simulate 48 hours difference

    await CycleTime.set()

    expect(storyPageIsReady).toHaveBeenCalledTimes(1)
    expect(Story.isInState).toHaveBeenCalledWith('Completed')
    expect(Story.getDateInState).toHaveBeenCalledWith('In Development')
    expect(hoursBetweenExcludingWeekends).toHaveBeenCalledWith('2022-08-23', '2022-09-23')
    expect(document.createElement).toHaveBeenCalledWith('div')
    expect(storyCreatedDivParent.insertBefore).toHaveBeenCalledTimes(1) // Ensure the div was inserted
  })
})

describe('clear function', () => {
  it('should remove cycleTimeDiv from the document if it exists', () => {
    document.body.innerHTML = `<div class="story-date-cycle-time"></div>`

    CycleTime.clear()

    const cycleTimeDiv = document.querySelector('.story-date-cycle-time')
    expect(cycleTimeDiv).toBeNull()
  })

  it('should not throw an error if cycleTimeDiv does not exist in the document', () => {
    document.body.innerHTML = ''

    expect(CycleTime.clear).not.toThrow()
  })
})
