import * as Sentry from '@sentry/browser'

import {sendEvent} from '@sx/analytics/event'
import {handleCommands} from '@sx/service-worker/handlers'
import registerListeners from '@sx/service-worker/listeners'
import {getSyncedSetting} from '@sx/utils/get-synced-setting'
import {Story} from '@sx/utils/story'

import {onInstallAndUpdate} from './on-install-and-update'
import {SlugManager} from './slug-manager'


registerListeners()
const manifestData = chrome.runtime.getManifest()
Sentry.init({
  dsn: 'https://966b241d3d57856bd13a0945fa9fa162@o49777.ingest.sentry.io/4506624214368256',
  release: manifestData.version,
  environment: process.env.NODE_ENV
})

chrome.commands.onCommand.addListener(handleCommands)

chrome.runtime.onInstalled.addListener(onInstallAndUpdate)

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo) {
  if (changeInfo.url && changeInfo.url.includes('app.shortcut.com')) {
    SlugManager.refreshCompanySlug(tabId, changeInfo).catch(e => {
      console.error('Error refreshing company slug:', e)
      Sentry.captureException(e)
    })
    chrome.tabs.sendMessage(tabId, {
      message: 'update',
      url: changeInfo.url
    })
    const enableStalledWorkWarnings = await getSyncedSetting('enableStalledWorkWarnings', true)
    if (enableStalledWorkWarnings) {
      chrome.tabs.sendMessage(tabId, {
        message: 'initDevelopmentTime',
        url: changeInfo.url
      })
      sendEvent('init_development_time').catch(e => {
        console.error('Error sending event:', e)
        Sentry.captureException(e)
      })
    }
    const enableTodoistOptions = await getSyncedSetting('enableTodoistOptions', false)
    if (enableTodoistOptions) {
      chrome.tabs.sendMessage(tabId, {
        message: 'initTodos',
        url: changeInfo.url
      })
      sendEvent('init_todos').catch(e => {
        console.error('Error sending event:', e)
        Sentry.captureException(e)
      })
    }
    chrome.tabs.sendMessage(tabId, {
      message: 'initNotes',
      data: await Story.notes(),
      url: changeInfo.url
    })
  }
}
)
