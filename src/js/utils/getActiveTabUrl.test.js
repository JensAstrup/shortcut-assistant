import {getActiveTabUrl} from './getActiveTabUrl'


describe('getActiveTabUrl function', () => {
  it('resolves with the URL of the active tab if one exists', async () => {
    const mockTab = {url: 'https://jestjs.io'}
    global.chrome.tabs.query.mockImplementationOnce((_queryInfo, callback) => {
      callback([mockTab])
    })

    await expect(getActiveTabUrl()).resolves.toEqual(mockTab.url)
  })

  it('rejects with an error if no active tabs are found', async () => {
    global.chrome.tabs.query.mockImplementationOnce((_queryInfo, callback) => {
      callback([])
    })

    await expect(getActiveTabUrl()).rejects.toThrowError('No active tab found')
  })

  it('rejects with the chrome.runtime.lastError if one exists', async () => {
    const mockError = new Error('Chrome runtime error')
    global.chrome.runtime.lastError = mockError
    global.chrome.tabs.query.mockImplementationOnce((_queryInfo, callback) => {
      callback([])
    })

    await expect(getActiveTabUrl()).rejects.toThrowError(mockError)
  })
})
