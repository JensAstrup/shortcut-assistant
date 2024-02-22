export function getActiveTabUrl() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      }
      else if (tabs.length === 0) {
        reject(new Error('No active tab found'))
      }
      else {
        let activeTabUrl = tabs[0].url
        resolve(activeTabUrl)
      }
    })
  })
}