export function redirectFromOmnibox(text, disposition) {
     let url = `https://app.shortcut.com/search#${encodeURIComponent(text)}`

    switch (disposition) {
        case 'currentTab':
            chrome.tabs.update({url})
            break
        case 'newForegroundTab':
            chrome.tabs.create({url})
            break
        case 'newBackgroundTab':
            chrome.tabs.create({url, active: false})
            break
        default:
            chrome.tabs.update({url})
            break
    }
}

