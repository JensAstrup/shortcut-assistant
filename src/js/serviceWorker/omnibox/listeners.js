import {redirectFromOmnibox} from './omnibox'

chrome.omnibox.onInputChanged.addListener(function (text, suggest){
    suggest([
        {content: text, description: `Search shortcut for ${text}`}
    ])
})

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
    redirectFromOmnibox(text, disposition)
})
