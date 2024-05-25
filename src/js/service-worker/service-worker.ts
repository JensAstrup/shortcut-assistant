import { sendEvent } from '@sx/analytics/event'
import { handleCommands } from '@sx/service-worker/handlers'
import checkHost from '@sx/utils/check-host'
import { getSyncedSetting } from '@sx/utils/get-synced-setting'
import scope from '@sx/utils/sentry'
import { Story } from '@sx/utils/story'
import Workspace from '@sx/workspace/workspace'

import { onInstallAndUpdate } from './on-install-and-update'
import { SlugManager } from './slug-manager'


// eslint-disable-next-line @typescript-eslint/no-misused-promises
chrome.commands.onCommand.addListener(handleCommands)

chrome.runtime.onInstalled.addListener(onInstallAndUpdate)

// eslint-disable-next-line @typescript-eslint/no-misused-promises
chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo) {
  if (changeInfo.url && checkHost(changeInfo.url) && changeInfo.url.includes('story')) {
    Workspace.activate()

    SlugManager.refreshCompanySlug(tabId, changeInfo)
    chrome.tabs.sendMessage(tabId, {
      message: 'update',
      url: changeInfo.url
    })
    const enableTodoistOptions = await getSyncedSetting('enableTodoistOptions', false)
    if (enableTodoistOptions) {
      chrome.tabs.sendMessage(tabId, {
        message: 'initTodos',
        url: changeInfo.url
      })
      sendEvent('init_todos').catch((e) => {
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
