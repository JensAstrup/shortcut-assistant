export function onInstall(){
    chrome.windows.create({
        url: '../installed.html',
        type: 'popup',
        width: 310,
        height: 500
    })
    chrome.storage.sync.set({'enableStalledWorkWarnings': true})
    chrome.storage.sync.set({'enableTodoistOptions': false})
}

export function onUpdate(){
    chrome.windows.create({
        url: '../updated.html',
        type: 'popup',
        width: 310,
        height: 500

    })
}

export function onInstallAndUpdate(details){
    if (details.reason === 'install') {
        onInstall(details)
    }
    else if (details.reason === 'update') {
        onUpdate(details)
    }
}