import { handleOAuthButton } from '@sx/oauth/oauth'
import { IpcRequestSaveUserToken } from '@sx/types/ipc-request'


// Mock chrome APIs
global.chrome = {
  ...global.chrome,
  identity: {
    ...global.chrome.identity,
    getAuthToken: jest.fn(),
  },
  runtime: {
    ...global.chrome.runtime,
    lastError: undefined,
    sendMessage: jest.fn(),
  },
}

describe('handleOAuthButton', () => {
  let addEventListenerSpy: jest.SpyInstance
  let button: HTMLElement | null

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="oauth">OAuth</button>
    `
    addEventListenerSpy = jest.spyOn(HTMLElement.prototype, 'addEventListener')
    handleOAuthButton()
    button = document.getElementById('oauth')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should log error if button is not found', () => {
    document.body.innerHTML = '' // Clear the button
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    handleOAuthButton()

    expect(consoleErrorSpy).toHaveBeenCalledWith('Button not found')
    consoleErrorSpy.mockRestore()
  })

  test('should add click event listener to the button', () => {
    expect(button).not.toBeNull()
    expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
  })

  test('should call chrome.identity.getAuthToken when button is clicked', () => {
    const getAuthTokenMock = global.chrome.identity.getAuthToken as jest.Mock

    button?.click()

    expect(getAuthTokenMock).toHaveBeenCalledWith({ interactive: true }, expect.any(Function))
  })

  test('should log chrome.runtime.lastError if present', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    global.chrome.runtime.lastError = new Error('Test Error')

    const getAuthTokenMock = global.chrome.identity.getAuthToken as jest.Mock
    getAuthTokenMock.mockImplementation((options, callback) => {
      callback(null)
    })

    button?.click()

    expect(consoleErrorSpy).toHaveBeenCalledWith(global.chrome.runtime.lastError)
    consoleErrorSpy.mockRestore()
  })

  test('should log error if no token is received', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    global.chrome.runtime.lastError = undefined

    const getAuthTokenMock = global.chrome.identity.getAuthToken as jest.Mock
    getAuthTokenMock.mockImplementation((options, callback) => {
      callback(null)
    })

    button?.click()

    expect(consoleErrorSpy).toHaveBeenCalledWith('No token received')
    consoleErrorSpy.mockRestore()
  })

  test('should send message with token', () => {
    const token = 'test-token'
    global.chrome.runtime.lastError = undefined

    const getAuthTokenMock = global.chrome.identity.getAuthToken as jest.Mock
    getAuthTokenMock.mockImplementation((options, callback) => {
      callback(token)
    })

    button?.click()

    expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({
      action: 'saveUserToken',
      data: { token },
    } as IpcRequestSaveUserToken)
  })
})