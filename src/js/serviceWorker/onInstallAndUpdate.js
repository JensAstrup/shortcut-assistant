export function onInstall(){
    chrome.windows.create({
        url: '../html/installed.html',
        type: 'popup',
        width: 310,
        height: 500
    })
    chrome.storage.sync.set({'enableStalledWorkWarnings': true})
    chrome.storage.sync.set({'enableTodoistOptions': false})
}

export async function onUpdate(){
    await chrome.action.setBadgeText({text: ' '})
    await chrome.action.setBadgeBackgroundColor({color: '#a30000'})
}

export function onInstallAndUpdate(details){
    if (details.reason === 'install') {
        onInstall(details)
    }
    else if (details.reason === 'update') {
        onUpdate(details)
    }
}