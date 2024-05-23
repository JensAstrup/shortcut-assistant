import {sendEvent} from '@sx/analytics/event'
import {handleCommands} from '@sx/service-worker/handlers'
import checkHost from '@sx/utils/check-host'
import {getSyncedSetting} from '@sx/utils/get-synced-setting'
import scope from '@sx/utils/sentry'
import {Story} from '@sx/utils/story'

import {onInstallAndUpdate} from './on-install-and-update'
import {SlugManager} from './slug-manager'


chrome.commands.onCommand.addListener(handleCommands)

chrome.runtime.onInstalled.addListener(onInstallAndUpdate)

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo) {
  if (changeInfo.url && checkHost(changeInfo.url) && changeInfo.url.includes('story')) {
    SlugManager.refreshCompanySlug(tabId, changeInfo).catch(e => {
      console.error('Error refreshing company slug:', e)
      scope.captureException(e)
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
        scope.captureException(e)
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
        scope.captureException(e)
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
