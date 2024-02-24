import {sendEvent} from '../../analytics/event'
import {redirectFromOmnibox, setOmniboxSuggestion} from './omnibox'
import * as Sentry from '@sentry/browser'

chrome.omnibox.onInputChanged.addListener(async function (text, suggest){
    await setOmniboxSuggestion(text)
})

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
    redirectFromOmnibox(text, disposition)
    sendEvent('omnibox_entered').catch((error) => {
        console.error(error)
        Sentry.captureException(error)
    })
})
