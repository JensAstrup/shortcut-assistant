import IpcRequest from '@sx/types/ipc-request'


chrome.runtime.onMessage.addListener((request: IpcRequest) => {
  if (request.action === 'saveUserToken') {
    fetchUserInfo(request.data.token)
  }
})

export async function fetchUserInfo(token: string): Promise<void> {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userInfo = await response.json()
  }
  catch (error) {
    console.error('Error fetching user info:', error)
  }
}
