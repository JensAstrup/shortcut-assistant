import changeState from '../../src/js/keyboard-shortcuts/change-state'
import copyBranchAndMoveToInDevelopment
  from '../../src/js/keyboard-shortcuts/copy-branch-move-to-in-development'
import copyGitBranch from '../../src/js/keyboard-shortcuts/copy-git-branch'
import {getStateDiv} from '../../src/js/utils/get-state-div'


jest.mock('../../src/js/keyboard-shortcuts/copy-git-branch', () => ({
  __esModule: true,
  default: jest.fn(),
}))
jest.mock('../../src/js/keyboard-shortcuts/change-state', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined), // Assuming it resolves to undefined
}))
jest.mock('../../src/js/utils/get-state-div', () => ({
  __esModule: true,
  getStateDiv: jest.fn(),
}))

interface MockedHtmlElement extends HTMLElement {
  click: jest.Mock
}

const mockedCopyGitBranch = copyGitBranch as jest.MockedFunction<typeof copyGitBranch>
const mockedChangeState = changeState as jest.MockedFunction<typeof changeState>
const mockedGetStateDiv = getStateDiv as jest.MockedFunction<typeof getStateDiv>

describe('copyBranchAndMoveToInDevelopment', () => {
  it('calls copyGitBranch and then changes state', async () => {
    const stateDivMock = {click: jest.fn()} as MockedHtmlElement

    mockedCopyGitBranch.mockResolvedValue()
    mockedChangeState.mockResolvedValue()  // Assume it resolves immediately for simplicity
    mockedGetStateDiv.mockReturnValue(stateDivMock)

    await copyBranchAndMoveToInDevelopment()

    expect(mockedCopyGitBranch).toHaveBeenCalled()
    expect(mockedChangeState).toHaveBeenCalled()
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
