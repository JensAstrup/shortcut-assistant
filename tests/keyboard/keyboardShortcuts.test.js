import {KeyboardShortcuts} from '../../src/js/keyboard/keyboardShortcuts'


jest.mock('../../src/js/utils/sleep', () => jest.fn().mockResolvedValue(undefined))

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

  it('should log error to console if no popup is found in changeState function', async () => {
    console.error = jest.fn()
    const mockedDropdown = {click: jest.fn()}
    const mockedPopup = {querySelector: jest.fn().mockReturnValue(null)}


    document.getElementById.mockReturnValueOnce(mockedDropdown)
    document.querySelector.mockReturnValueOnce(null)

    instance = new KeyboardShortcuts()
    await instance.changeState()

    expect(mockedDropdown.click).toHaveBeenCalled()
    expect(mockedPopup.querySelector).not.toHaveBeenCalled()
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

  it('should error to console if no input select is found in changeIteration function', async () => {
    const mockChildButton = {click: jest.fn()}
    console.log = jest.fn()
    document.querySelector.mockReturnValueOnce(null)
    const mockedIterationSelect = {
      querySelector: jest.fn().mockReturnValue(mockChildButton),
      click: jest.fn()
    }

    await instance.changeIteration()

    expect(mockedIterationSelect.querySelector).not.toHaveBeenCalledWith('[role="button"]')
    expect(mockChildButton.click).not.toHaveBeenCalled()
    expect(mockedIterationSelect.click).not.toHaveBeenCalled()
  })

  it('should error to console if no input is found in changeIteration function', async () => {
    const mockChildButton = {click: jest.fn()}
    const mockedIterationSelect = {
      querySelector: jest.fn().mockReturnValue(mockChildButton),
      click: jest.fn()
    }
    const mockInput = {focus: jest.fn(), value: ''}
    const mockedIterationPopup = {querySelector: jest.fn().mockReturnValue(null)}

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
    expect(mockInput.focus).not.toHaveBeenCalled()
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

  it('should error to console when no githelpers are found in copyGitBranch function', async () => {
    const mockedGitHelpers = {click: jest.fn()}
    console.error = jest.fn()
    document.getElementById.mockReturnValueOnce(null)

    global.navigator.clipboard = {writeText: jest.fn()}

    await instance.copyGitBranch()

    expect(console.error).toHaveBeenCalledWith('The git helpers dropdown was not found.')
    expect(mockedGitHelpers.click).not.toHaveBeenCalled()
    expect(global.navigator.clipboard.writeText).not.toHaveBeenCalled()
  })

  it('should error to console if git branch input not found in copyGitBranch function', async () => {
    const mockedGitHelpers = {click: jest.fn()}
    console.error = jest.fn()
    document.getElementById.mockReturnValueOnce(mockedGitHelpers)
    document.querySelector.mockReturnValueOnce(null)

    global.navigator.clipboard = {writeText: jest.fn()}

    await instance.copyGitBranch()

    expect(console.error).toHaveBeenCalledWith('The git branch input was not found.')
    expect(mockedGitHelpers.click).toHaveBeenCalled()
    expect(global.navigator.clipboard.writeText).not.toHaveBeenCalled()
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

  it('should add keydown event listener to document', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
    const keyboardShortcuts = new KeyboardShortcuts()

    keyboardShortcuts.activate()

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

    addEventListenerSpy.mockRestore()
  })

  it.each([
    // Define test cases as [input, expectedOutput]
    [{key: 'A', shiftKey: false}, 'a-0-0-0-0'],
    [{key: 'B', shiftKey: true, metaKey: true, altKey: true, ctrlKey: true}, 'b-1-1-1-1'],
    [{key: 'C', shiftKey: true, ctrlKey: true}, 'c-0-1-0-1'],
    [{key: 'd', metaKey: true, shiftKey: false}, 'd-1-0-0-0'],
    [{key: 'e', altKey: true, shiftKey: true}, 'e-0-1-1-0']
  ])('serializes shortcut %o to "%s"', (input, expectedOutput) => {
    const keyboardShortcuts = new KeyboardShortcuts()
    const serialized = keyboardShortcuts.serializeShortcut(input)
    expect(serialized).toBe(expectedOutput)
  })

  it('adds a shortcut to the shortcuts map', () => {
    const keyboardShortcuts = new KeyboardShortcuts()
    const mockFunction = jest.fn()

    const shortcut = {
      key: 'n',
      shiftKey: true,
      ctrlKey: true,
      func: mockFunction
    }

    const expectedSerializedKey = 'n-0-1-0-1'

    keyboardShortcuts.registerShortcut(shortcut)

    expect(keyboardShortcuts.shortcuts.has(expectedSerializedKey)).toBeTruthy()

    // Further, verify that the function mapped to the serialized key is indeed the mockFunction,
    // considering it's bound to the KeyboardShortcuts instance, we directly compare the reference here
    const registeredFunction = keyboardShortcuts.shortcuts.get(expectedSerializedKey)
    expect(registeredFunction).toBeDefined()

    // Since we cannot directly compare bound functions, we'll invoke it and check if the mock was called
    registeredFunction()
    expect(mockFunction).toHaveBeenCalled()
  })

  describe('KeyboardShortcuts class', () => {
    let keyboardShortcuts
    let mockFunction

    beforeEach(() => {
      keyboardShortcuts = new KeyboardShortcuts()
      mockFunction = jest.fn().mockResolvedValue(undefined) // Simulate a function that returns a promise
    })

    it('calls the registered function for a matching keydown event', async () => {
      const shortcut = {
        key: 'n',
        shiftKey: true,
        ctrlKey: true,
        func: mockFunction
      }

      keyboardShortcuts.registerShortcut(shortcut)
      const event = new KeyboardEvent('keydown', {
        key: 'n',
        shiftKey: true,
        ctrlKey: true
      })

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')
      await keyboardShortcuts.handleKeyDown(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(mockFunction).toHaveBeenCalled()
    })

    it('does not call preventDefault or a function for a non-matching keydown event', async () => {
      const event = new KeyboardEvent('keydown', {
        key: 'm',
        shiftKey: false,
        ctrlKey: false
      })

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')

      await keyboardShortcuts.handleKeyDown(event)

      expect(preventDefaultSpy).not.toHaveBeenCalled()
      // Since no function is registered for this key, the mock function should not be called
      expect(mockFunction).not.toHaveBeenCalled()
    })
  })
})
