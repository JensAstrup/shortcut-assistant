import {KeyboardShortcuts} from './keyboardShortcuts'


jest.mock('../utils/utils', () => ({
  sleep: jest.fn().mockResolvedValue(undefined)
}))

describe('Shortcuts', () => {
  let instance

  beforeEach(() => {
    document.getElementById = jest.fn()
    document.querySelector = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })


  test('changeState function', async () => {
    const mockedDropdown = {click: jest.fn()}
    const mockedPopup = {querySelector: jest.fn()}
    const mockedInput = {
      focus: jest.fn(), set value(_) {
      }
    }

    instance = new KeyboardShortcuts()

    document.getElementById.mockReturnValueOnce(mockedDropdown)
    document.querySelector.mockReturnValueOnce(mockedPopup)

    mockedPopup.querySelector.mockReturnValue(mockedInput)

    await instance.changeState()

    expect(mockedDropdown.click).toHaveBeenCalled()
    expect(mockedPopup.querySelector).toHaveBeenCalled()
    expect(mockedInput.focus).toHaveBeenCalled()
  })

  test('changeState function with no dropdown', async () => {
    instance = new KeyboardShortcuts()

    document.getElementById.mockReturnValueOnce(null)

    await instance.changeState()
    expect(document.getElementById).toHaveBeenCalledWith('story-dialog-state-dropdown')
  })

  test('changeState function with no input', async () => {
    const mockedDropdown = {click: jest.fn()}
    const mockedPopup = {querySelector: jest.fn()}
    const mockedInput = null

    instance = new KeyboardShortcuts()

    document.getElementById.mockReturnValueOnce(mockedDropdown)
    document.querySelector.mockReturnValueOnce(mockedPopup)

    mockedPopup.querySelector.mockReturnValue(mockedInput)

    await instance.changeState()

    expect(mockedDropdown.click).toHaveBeenCalled()
    expect(mockedPopup.querySelector).toHaveBeenCalled()
  })

  test('changeIteration function', async () => {
    const mockChildButton = {click: jest.fn()}
    const mockedIterationSelect = {
      querySelector: jest.fn().mockReturnValue(mockChildButton),
      click: jest.fn()
    }
    const mockInput = {focus: jest.fn(), value: ''}
    const mockedIterationPopup = {querySelector: jest.fn().mockReturnValue(mockInput)}

    document.querySelector.mockImplementation((selector) => {
      if (selector === '[data-perma-id="iteration-select"]') {
        return mockedIterationSelect
      }
      else if (selector === '.iteration-selector') {
        return mockedIterationPopup
      }
    })

    await instance.changeIteration()

    expect(mockedIterationSelect.querySelector).toHaveBeenCalledWith('[role="button"]')
    expect(mockChildButton.click).toHaveBeenCalled()
    expect(mockedIterationSelect.click).toHaveBeenCalled()
    expect(mockedIterationPopup.querySelector).toHaveBeenCalledWith('.autocomplete-input')
    expect(mockInput.focus).toHaveBeenCalled()
  })

  test('changeIteration function with no childButton', async () => {
    const mockChildButton = null
    const mockedIterationSelect = {
      querySelector: jest.fn().mockReturnValue(mockChildButton),
      click: jest.fn()
    }
    const mockInput = {focus: jest.fn(), value: ''}
    const mockedIterationPopup = {querySelector: jest.fn().mockReturnValue(mockInput)}

    document.querySelector.mockImplementation((selector) => {
      if (selector === '[data-perma-id="iteration-select"]') {
        return mockedIterationSelect
      }
      else if (selector === '.iteration-selector') {
        return mockedIterationPopup
      }
    })

    await instance.changeIteration()

    expect(mockedIterationSelect.querySelector).toHaveBeenCalledWith('[role="button"]')
    expect(mockedIterationSelect.click).not.toHaveBeenCalled()
    expect(mockedIterationPopup.querySelector).not.toHaveBeenCalled()
    expect(mockInput.focus).not.toHaveBeenCalled()
  })

  test('changeIteration function with no popup', async () => {
    const mockChildButton = {click: jest.fn()}
    const mockedIterationSelect = {
      querySelector: jest.fn().mockReturnValue(mockChildButton),
      click: jest.fn()
    }
    const mockInput = {focus: jest.fn(), value: ''}
    const mockedIterationPopup = null

    document.querySelector.mockImplementation((selector) => {
      if (selector === '[data-perma-id="iteration-select"]') {
        return mockedIterationSelect
      }
      else if (selector === '.iteration-selector') {
        return mockedIterationPopup
      }
    })

    await instance.changeIteration()

    expect(mockedIterationSelect.querySelector).toHaveBeenCalledWith('[role="button"]')
    expect(mockChildButton.click).toHaveBeenCalled()
    expect(mockedIterationSelect.click).toHaveBeenCalled()
    expect(mockInput.focus).not.toHaveBeenCalled()
  })

  test('copyGitBranch function', async () => {
    const mockedGitHelpers = {click: jest.fn()}
    const mockedBranch = {value: ''}

    document.getElementById.mockReturnValueOnce(mockedGitHelpers)
    document.querySelector.mockReturnValueOnce(mockedBranch)

    global.navigator.clipboard = {writeText: jest.fn()}

    await instance.copyGitBranch()

    expect(mockedGitHelpers.click).toHaveBeenCalled()
    expect(global.navigator.clipboard.writeText).toHaveBeenCalled()
  })

  test('_getStateDivWithText function', () => {
    const childDivs = [{innerText: 'In Development '}]
    const parentDiv = {querySelectorAll: jest.fn().mockReturnValue(childDivs)}

    document.querySelector.mockReturnValueOnce(parentDiv)

    const result = instance._getStateDivWithText('In Development')

    expect(result).toEqual(childDivs[0])

  })


  test('_getStateDivWithText function with no results', () => {
    const childDivs = [{innerText: 'Other'}]
    const parentDiv = {querySelectorAll: jest.fn().mockReturnValue(childDivs)}

    document.querySelector.mockReturnValueOnce(parentDiv)

    const result = instance._getStateDivWithText('In Development')

    expect(result).toEqual(null)

  })

  test('_getStateDivWithText function with no parent div', () => {
    const parentDiv = null

    document.querySelector.mockReturnValueOnce(parentDiv)

    jest.spyOn(console, 'error').mockImplementation(() => {
    })
    instance._getStateDivWithText('In Development')

    expect(console.error).toHaveBeenCalledWith('The parent div with class "list apply-on-click" was not found.')

  })

  test('copyBranchAndMoveToInDevelopment function', async () => {
    const mockChangeState = jest.spyOn(KeyboardShortcuts.prototype, 'changeState')
    const mockCopyGitBranch = jest.spyOn(KeyboardShortcuts.prototype, 'copyGitBranch')

    const stateDiv = {click: jest.fn()}
    instance._getStateDivWithText = jest.fn().mockReturnValue(stateDiv)

    mockChangeState.mockResolvedValueOnce(undefined)
    mockCopyGitBranch.mockResolvedValueOnce(undefined)

    await instance.copyBranchAndMoveToInDevelopment()

    expect(mockCopyGitBranch).toHaveBeenCalled()
    expect(instance._getStateDivWithText).toHaveBeenCalledWith('In Development')
    expect(stateDiv.click).toHaveBeenCalled()

  })

  test('copyBranchAndMoveToInDevelopment function with no stateDiv', async () => {
    const mockChangeState = jest.spyOn(KeyboardShortcuts.prototype, 'changeState')
    const mockCopyGitBranch = jest.spyOn(KeyboardShortcuts.prototype, 'copyGitBranch')

    instance._getStateDivWithText = jest.fn().mockReturnValue(null)

    mockChangeState.mockResolvedValueOnce(undefined)
    mockCopyGitBranch.mockResolvedValueOnce(undefined)

    await instance.copyBranchAndMoveToInDevelopment()

    expect(mockCopyGitBranch).toHaveBeenCalled()
    expect(instance._getStateDivWithText).toHaveBeenCalledWith('In Development')
  })
})
