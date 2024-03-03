import {Story} from '../utils/story'
import {storyPageIsReady} from '../utils/storyPageIsReady'
import * as StoryModule from '../utils/story'
import {DevelopmentTime} from './developmentTime'


jest.mock('../utils/storyPageIsReady', () => ({
  storyPageIsReady: jest.fn().mockResolvedValue(true)
}))

jest.mock('../utils/story', () => ({
  Story: {
    isInState: jest.fn(),
    getTimeInState: jest.fn()
  }
}))

describe('DevelopmentTime.setTimeSpan', () => {
  const mockStateSpan = {textContent: 'Current state'}

  beforeEach(() => {
    jest.clearAllMocks()
    document.querySelector = jest.fn().mockImplementation(selector => {
      if (selector === '.story-state') return {querySelector: () => mockStateSpan}
      return null
    })
    mockStateSpan.textContent = 'Current state'
  })

  test('should subtract one day and show negative days for hours less than 48', () => {
    DevelopmentTime.setTimeSpan(24)
    expect(mockStateSpan.textContent).toBe('Current state (0.00 days)')
  })

  test('should accurately show days for hours equal to or greater than 48', () => {
    DevelopmentTime.setTimeSpan(72)
    expect(mockStateSpan.textContent).toBe('Current state (3.00 days)')
  })
})

describe('DevelopmentTime.set', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    StoryModule.Story.isInState.mockImplementation(() => false)
    StoryModule.Story.getTimeInState.mockReturnValue(0)

    jest.spyOn(DevelopmentTime, 'setTimeSpan').mockImplementation(() => {
    })
  })

  test('calls setTimeSpan with hours from In Development state', async () => {
    StoryModule.Story.isInState.mockImplementation(state => state === 'In Development')
    StoryModule.Story.getTimeInState.mockReturnValue(24)

    await DevelopmentTime.set()

    expect(DevelopmentTime.setTimeSpan).toHaveBeenCalledWith(24)
  })

  test('calls setTimeSpan with hours from Ready for Review state', async () => {
    StoryModule.Story.isInState.mockImplementation(state => state === 'Ready for Review')
    StoryModule.Story.getTimeInState.mockReturnValue(72)

    await DevelopmentTime.set()

    expect(DevelopmentTime.setTimeSpan).toHaveBeenCalledWith(72)
  })

  test('does not call setTimeSpan when not in Development or Review state', async () => {
    await DevelopmentTime.set()

    expect(DevelopmentTime.setTimeSpan).not.toHaveBeenCalled()
  })
})
