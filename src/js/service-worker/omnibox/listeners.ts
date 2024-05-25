import { sendEvent } from '@sx/analytics/event'
import scope from '@sx/utils/sentry'

import { redirectFromOmnibox, setOmniboxSuggestion } from './omnibox'


// eslint-disable-next-line @typescript-eslint/no-misused-promises
chrome.omnibox.onInputChanged.addListener(async function (text: string) {
  await setOmniboxSuggestion(text)
})

chrome.omnibox.onInputEntered.addListener((text: string, disposition: 'currentTab' | 'newForegroundTab' | 'newBackgroundTab') => {
  redirectFromOmnibox(text, disposition)
  sendEvent('omnibox_entered').catch((error) => {
    console.error(error)
    scope.captureException(error)
  })
})
