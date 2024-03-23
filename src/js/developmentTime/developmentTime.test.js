import * as StoryModule from '../utils/story'
import {DevelopmentTime} from './developmentTime'


jest.mock('../utils/storyPageIsReady', () => jest.fn().mockResolvedValue(true))

jest.mock('../utils/story', () => ({
  Story: {
    isInState: jest.fn(),
    getTimeInState: jest.fn()
  }
}))

describe('DevelopmentTime.setTimeSpan', () => {
  const mockStateSpan = {
    textContent: 'Current state',
    appendChild: jest.fn(),
    querySelector: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    document.querySelector = jest.fn().mockImplementation(selector => {
      if (selector === '.story-state') return {querySelector: () => mockStateSpan}
      return null
    })
    mockStateSpan.textContent = 'Current state'
  })

  it('appends a span with days elapsed to the state span', () => {
    DevelopmentTime.setTimeSpan(72)
    expect(mockStateSpan.appendChild.mock.calls[0][0].textContent).toBe(' (3.00 days)')
  })

  it('sets data-assistant attribute to true', () => {
    DevelopmentTime.setTimeSpan(72)
    expect(mockStateSpan.appendChild.mock.calls[0][0].getAttribute('data-assistant')).toBe('true')
  })
})

describe('DevelopmentTime.remove', () => {
  const mockTimeSpan = {remove: jest.fn()}

  beforeEach(() => {
    jest.clearAllMocks()
    document.querySelector = jest.fn().mockImplementation(() => mockTimeSpan)
  })

  it('removes the time span', () => {
    DevelopmentTime.remove()
    expect(mockTimeSpan.remove).toHaveBeenCalled()
  })

  it('does not remove the time span if it does not exist', () => {
    document.querySelector = jest.fn().mockImplementation(() => null)
    DevelopmentTime.remove()
    expect(mockTimeSpan.remove).not.toHaveBeenCalled()
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

  it('calls setTimeSpan with hours from In Development state', async () => {
    StoryModule.Story.isInState.mockImplementation(state => state === 'In Development')
    StoryModule.Story.getTimeInState.mockReturnValue(24)

    await DevelopmentTime.set()

    expect(DevelopmentTime.setTimeSpan).toHaveBeenCalledWith(24)
  })

  it('calls setTimeSpan with hours from Ready for Review state', async () => {
    StoryModule.Story.isInState.mockImplementation(state => state === 'Ready for Review')
    StoryModule.Story.getTimeInState.mockReturnValue(72)

    await DevelopmentTime.set()

    expect(DevelopmentTime.setTimeSpan).toHaveBeenCalledWith(72)
  })

  it('does not call setTimeSpan when not in Development or Review state', async () => {
    await DevelopmentTime.set()

    expect(DevelopmentTime.setTimeSpan).not.toHaveBeenCalled()
  })
})
