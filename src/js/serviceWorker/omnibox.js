chrome.omnibox.onInputChanged.addListener(function (text, suggest){
    suggest([
        {content: text, description: `Search shortcut for ${text}`}
    ])
})

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
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
})

