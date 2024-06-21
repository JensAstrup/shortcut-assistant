import { fetchUserInfo } from '@sx/oauth/service-worker/oauth'



async function registerUser(token: string): Promise<void> {
  const userInfo = await fetchUserInfo(token)
  const url = `${process.env.PROXY_URL}/users/register`
  const { shortcutApiToken } = await chrome.storage.sync.get('shortcutApiToken')
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: userInfo.email,
      name: userInfo.name,
      shortcutApiToken: shortcutApiToken,
      googleId: userInfo.id,
    }),
  })
}

export default registerUser
