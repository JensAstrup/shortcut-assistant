export async function getOpenAiToken() {
  try {
    const result = await chrome.storage.local.get('openAIToken')
    const value = result['openAIToken']
    if (value !== undefined) {
      return value
    }
    else {
      return null
    }
  } catch (error) {
    console.error('Error getting OpenAI token:', error)
    throw error
  }
}
