import * as Sentry from '@sentry/browser'

import {sendEvent} from '../../analytics/event'

import {redirectFromOmnibox, setOmniboxSuggestion} from './omnibox'


chrome.omnibox.onInputChanged.addListener(async function (text: string) {
  await setOmniboxSuggestion(text)
})

chrome.omnibox.onInputEntered.addListener((text: string, disposition: 'currentTab' | 'newForegroundTab' | 'newBackgroundTab') => {
  redirectFromOmnibox(text, disposition)
  sendEvent('omnibox_entered').catch((error) => {
    console.error(error)
    Sentry.captureException(error)
  })
})
