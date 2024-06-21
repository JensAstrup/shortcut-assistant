import registerUser from '@sx/oauth/service-worker/registration'
import IpcRequest from '@sx/types/ipc-request'


chrome.runtime.onMessage.addListener((request: IpcRequest) => {
  if (request.action === 'saveUserToken') {
    const token = request.data.token
    registerUser(token)
  }
})

export async function fetchUserInfo(token: string): Promise<Record<string, string>> {
  const url = 'https://www.googleapis.com/oauth2/v2/userinfo'
  const headers = new Headers()
  headers.append('Authorization', `Bearer ${token}`)

  try {
    const response = await fetch(url, { headers })
    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`)
    }
    const userInfo = await response.json() as Record<string, string>
    return userInfo
  }
  catch (error) {
    console.error('Error fetching user info:', error)
    throw error
  }
}
