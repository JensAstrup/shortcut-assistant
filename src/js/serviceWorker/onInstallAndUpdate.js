import * as Sentry from '@sentry/browser'


export class InstallAndUpdate {
    static onInstall() {
        chrome.windows.create({
            url: '../html/installed.html',
            type: 'popup',
            width: 310,
            height: 500
        })
        chrome.storage.sync.set({'enableStalledWorkWarnings': true})
        chrome.storage.sync.set({'enableTodoistOptions': false})
    }

    static async onUpdate() {
        await chrome.action.setBadgeText({text: ' '})
        await chrome.action.setBadgeBackgroundColor({color: '#a30000'})
    }
}

export function onInstallAndUpdate(details){
    if (details.reason === 'install') {
        InstallAndUpdate.onInstall(details)
    }
    else if (details.reason === 'update') {
        if (process.env.CHANGELOG_VERSION === process.env.VERSION) {
            InstallAndUpdate.onUpdate(details).catch(e => {
                console.error('Error updating:', e)
                Sentry.captureException(e)
            })
        }
    }
}
