import { IpcRequestSaveUserToken } from '@sx/types/ipc-request'


export function handleOAuthButton(): void {
  const button = document.getElementById('oauth')
  if (!button) {
    console.error('Button not found')
    return
  }
  button.addEventListener('click', function () {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError)
        return
      }
      if (!token) {
        console.error('No token received')
        return
      }
      chrome.runtime.sendMessage({ action: 'saveUserToken', data: { token } } as IpcRequestSaveUserToken)
    })
  })
}

document.addEventListener('DOMContentLoaded', function () {
  handleOAuthButton()
})
