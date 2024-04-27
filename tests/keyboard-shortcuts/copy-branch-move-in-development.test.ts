import changeState from '@sx/keyboard-shortcuts/change-state'
import copyBranchAndMoveToInDevelopment
  from '@sx/keyboard-shortcuts/copy-branch-move-to-in-development'
import copyGitBranch from '@sx/keyboard-shortcuts/copy-git-branch'
import {getStateDiv} from '@sx/utils/get-state-div'
import sleep from '@sx/utils/sleep'


jest.mock('@sx/keyboard-shortcuts/copy-git-branch', () => ({
  __esModule: true,
  default: jest.fn(),
}))
jest.mock('@sx/keyboard-shortcuts/change-state', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined), // Assuming it resolves to undefined
}))
jest.mock('@sx/utils/get-state-div', () => ({
  __esModule: true,
  getStateDiv: jest.fn(),
}))
jest.mock('@sx/utils/sleep', () => jest.fn(() => Promise.resolve()))

global.chrome.storage.sync = {get: jest.fn()} as unknown as jest.Mocked<typeof chrome.storage.sync>

// @ts-expect-error - TS doesn't know about the mock implementation
global.chrome.storage.sync.get.mockImplementation((key, callback) => {
  const data = {inDevelopmentText: 'In Development'}
  if (typeof callback === 'function') {
    callback(data)
  }
  return data
})


interface MockedHtmlElement extends HTMLElement {
  click: jest.Mock
}

const mockedCopyGitBranch = copyGitBranch as jest.MockedFunction<typeof copyGitBranch>
const mockedChangeState = changeState as jest.MockedFunction<typeof changeState>
const mockedGetStateDiv = getStateDiv as jest.MockedFunction<typeof getStateDiv>

describe('copyBranchAndMoveToInDevelopment', () => {
  it('sends an event to the background script', async () => {
    chrome.runtime.sendMessage = jest.fn()
    await copyBranchAndMoveToInDevelopment()
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      action: 'sendEvent',
      data: {eventName: 'copy_git_branch_and_move_to_in_development'}
    })
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
