type settingValue = string | number | boolean | undefined

export async function getSyncedSetting<T>(setting: string, defaultValue: T | undefined): Promise<T extends undefined ? settingValue : T> {
  try {
    const result = await chrome.storage.sync.get(setting)
    const {[setting]: value = defaultValue} = result
    return value
  }
  catch (error) {
    console.error('Error getting setting value:', error)
    throw error
  }
}
