import {redirectFromOmnibox, setOmniboxSuggestion} from './omnibox'
import * as Sentry from '@sentry/browser'

chrome.omnibox.onInputChanged.addListener(async function (text, suggest){
    await setOmniboxSuggestion(text)
})

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
    redirectFromOmnibox(text, disposition).catch((error) => {
        console.error(error)
        Sentry.captureException(error)
    })
})
