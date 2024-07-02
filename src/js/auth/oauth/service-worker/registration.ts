async function registerUser(token: string): Promise<void> {
  const url = `${process.env.PROXY_URL}/users/register`
  const result = await chrome.storage.local.get('shortcutApiToken')
  const shortcutApiToken = result.shortcutApiToken
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${shortcutApiToken}`
    },
    body: JSON.stringify({
      shortcutApiToken: shortcutApiToken,
      googleAuthToken: token,
    }),
  })
  if (!response.ok) {
    throw new Error(`HTTP error. Status: ${response.status}`)
  }
  const data = await response.json()
  await chrome.storage.local.set({ backendKey: data.key })
}

export default registerUser
