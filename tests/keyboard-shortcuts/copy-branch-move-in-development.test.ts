import changeState from '@sx/keyboard-shortcuts/change-state'
import copyBranchAndMoveToInDevelopment
  from '@sx/keyboard-shortcuts/copy-branch-move-to-in-development'
import copyGitBranch from '@sx/keyboard-shortcuts/copy-git-branch'
import {getStateDiv} from '@sx/utils/get-state-div'
import {logError} from '@sx/utils/log-error'
import sleep from '@sx/utils/sleep'


jest.mock('@sx/keyboard-shortcuts/copy-git-branch', () => ({
  __esModule: true,
  default: jest.fn(),
}))
jest.mock('@sx/keyboard-shortcuts/change-state', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}))
jest.mock('@sx/utils/get-state-div', () => ({
  __esModule: true,
  getStateDiv: jest.fn(),
}))
jest.mock('@sx/utils/sleep', () => jest.fn(() => Promise.resolve()))
jest.mock('@sx/utils/log-error')

jest.mock('@sx/workspace/workspace', () => {
  class MockWorkspace {
    async activate() {
      await MockWorkspace.states()
    }

    static async states(fetch = true) {
      if (!fetch) {
        return null
      }
      return { Started: ['In Development'] }
    }
  }

  return {
    __esModule: true,
    default: MockWorkspace,
  }
})


interface MockedHtmlElement extends HTMLElement {
  click: jest.Mock
}

const mockedCopyGitBranch = copyGitBranch as jest.MockedFunction<typeof copyGitBranch>
const mockedChangeState = changeState as jest.MockedFunction<typeof changeState>
const mockedGetStateDiv = getStateDiv as jest.MockedFunction<typeof getStateDiv>

describe('copyBranchAndMoveToInDevelopment', () => {

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('sends an event to track event', async () => {
    chrome.runtime.sendMessage = jest.fn().mockResolvedValue(undefined)
    await copyBranchAndMoveToInDevelopment()
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      action: 'sendEvent',
      data: {eventName: 'copy_git_branch_and_move_to_in_development'}
    })
  })

  it('logs an error if the event message fails', async () => {
    const error = new Error('Error')
    chrome.runtime.sendMessage = jest.fn().mockRejectedValue(error)
    console.error = jest.fn()
    await copyBranchAndMoveToInDevelopment()
    expect(logError).toHaveBeenCalledWith(error)
  })

  it('calls copyGitBranch and then changes state', async () => {
    const stateDivMock = {click: jest.fn()} as MockedHtmlElement

    mockedCopyGitBranch.mockResolvedValue()
    mockedChangeState.mockResolvedValue()  // Assume it resolves immediately for simplicity
    mockedGetStateDiv.mockReturnValue(stateDivMock)

    await copyBranchAndMoveToInDevelopment()

    expect(mockedCopyGitBranch).toHaveBeenCalled()
    expect(mockedChangeState).toHaveBeenCalled()
    expect(sleep).toHaveBeenCalledWith(300)
  })

  it('clicks the state div if it is found', async () => {
    const stateDivMock = {click: jest.fn()} as MockedHtmlElement

    mockedCopyGitBranch.mockResolvedValue()
    mockedChangeState.mockResolvedValue()  // Simulate promise resolution after mockedChangeState
    mockedGetStateDiv.mockReturnValue(stateDivMock)  // Return the mock div that should be clicked

    await copyBranchAndMoveToInDevelopment()

    expect(mockedGetStateDiv).toHaveBeenCalledWith('In Development')
    expect(stateDivMock.click).toHaveBeenCalled()
  })

  it('does not attempt to click if the state div is not found', async () => {
    mockedCopyGitBranch.mockResolvedValue()
    mockedChangeState.mockResolvedValue()
    mockedGetStateDiv.mockReturnValue(null)  // No div is found

    await copyBranchAndMoveToInDevelopment()

    // Here you verify that the function does not throw or fail when no div is found
    expect(getStateDiv).toHaveBeenCalledWith('In Development')
    // As no div was returned, there should be no click event
    // Therefore, we don't have a specific assertion for no click, but no error should be thrown
  })
})
