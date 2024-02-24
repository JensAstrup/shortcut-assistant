import {getSyncedSetting} from './getSyncedSetting'


describe('getSyncedSetting function', () => {
  it('fetches the setting successfully', async () => {
    const setting = 'test'
    const defaultValue = 'defaultValue'
    const expectedValue = 'expectedValue'

    chrome.storage.sync.get.mockImplementation((key, callback) => {
      const data = {test: 'expectedValue'} // Simulate the expected stored data
      if (typeof callback === 'function') {
        return callback(data)
      }
      return data
    })


    const syncedSetting = await getSyncedSetting(setting, defaultValue)
    expect(syncedSetting).toEqual(expectedValue)
  })

  it('returns default value if setting is not found', async () => {
    const setting = 'test'
    const defaultValue = 'defaultValue'

    chrome.storage.sync.get.mockImplementation((key, callback) => {
      if (typeof callback === 'function') {
        callback({})
      }
      return {}
    })

    const value = await getSyncedSetting(setting, defaultValue)
    expect(value).toEqual(defaultValue)
  })

  it('throws error if fetching setting fails', async () => {
    const setting = 'test'
    const defaultValue = 'defaultValue'
    const error = new Error('Failed to fetch')
    console.error = jest.fn()
    chrome.storage.sync.get.mockImplementation((key, callback) => {
      const data = {[key]: 'expectedValue'} // Simulate the expected stored data
      if (typeof callback === 'function') {
        throw error
      }
      if (key === setting) {
        throw error
      }
    })

    await expect(getSyncedSetting(setting, defaultValue)).rejects.toThrow(error)
    expect(console.error).toHaveBeenCalledWith('Error getting setting value:', error)
  })
})
