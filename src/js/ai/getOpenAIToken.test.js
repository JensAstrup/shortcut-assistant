// getOpenAiToken.test.js

import {getOpenAiToken} from './getOpenAiToken'


describe('getOpenAiToken', () => {

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  it('should return the token when it exists', async () => {
    const expectedToken = 'test-token'
    chrome.storage.local.get.mockImplementation((key, callback) => {
      if (typeof callback !== 'function') {
        return {'openAIToken': expectedToken}
      }
      callback({'openAIToken': expectedToken})
    })

    const token = await getOpenAiToken()
    expect(token).toEqual(expectedToken)
    expect(chrome.storage.local.get).toHaveBeenCalledWith('openAIToken')
  })

  it('should return null when the token does not exist', async () => {
    chrome.storage.local.get.mockImplementation((key, callback) => {
      if (typeof callback !== 'function') {
        return {}
      }
      callback({})
    })
    const token = await getOpenAiToken()
    expect(token).toBeNull()
    expect(chrome.storage.local.get).toHaveBeenCalledWith('openAIToken')
  })

  it('should throw an error when chrome.storage.local.get fails', async () => {
    const errorMessage = 'Error getting OpenAI token'
    chrome.storage.local.get.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    await expect(getOpenAiToken()).rejects.toThrow(errorMessage)
  })
})
