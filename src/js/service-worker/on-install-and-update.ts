import * as Sentry from '@sentry/browser'


export class InstallAndUpdate {
  static onInstall() {
    chrome.windows.create({
      url: '../html/installed.html',
      type: 'popup',
      width: 310,
      height: 500
    })
    chrome.storage.sync.set({'enableTodoistOptions': false}).catch(e => {
      console.error('Error setting enableTodoistOptions:', e)
      Sentry.captureException(e)
    })
  }

  static async onUpdate() {
    await chrome.action.setBadgeText({text: ' '})
    await chrome.action.setBadgeBackgroundColor({color: '#a30000'})
  }
}


export function onInstallAndUpdate(details: Record<string, string>) {
  if (details.reason === 'install') {
    InstallAndUpdate.onInstall()
  }
  else if (details.reason === 'update') {
    // Only display the update page if the changelog has been updated for the current version
    if (process.env.CHANGELOG_VERSION === process.env.VERSION) {
      InstallAndUpdate.onUpdate().catch(e => {
        console.error('Error updating:', e)
        Sentry.captureException(e)
      })
    }
  }
}
