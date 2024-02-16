import {getCompanySlug} from '../companySlug'

export async function redirectFromOmnibox(text, disposition){
    let url
    if(!isNaN(text)) {
        const companySlug = await getCompanySlug();
        if (companySlug) {
            url = `https://app.shortcut.com/${companySlug}/story/${text}`
        }
        else{
            url = `https://app.shortcut.com/search#${encodeURIComponent(text)}`
        }
    }
    else{
        url = `https://app.shortcut.com/search#${encodeURIComponent(text)}`
    }

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

export async function setOmniboxSuggestion(text){
    if (!isNaN(text)) {
        const companySlug = await getCompanySlug()
        if (companySlug) {
            chrome.omnibox.setDefaultSuggestion({description: `Open story sc-${text}`})
            return
        }
    }
    chrome.omnibox.setDefaultSuggestion({description: `Search shortcut for ${text}`})
}