import * as Sentry from '@sentry/browser'

import callOpenAI from '../ai/callOpenAI'
import getOpenAiToken from '../ai/getOpenAiToken'
import {sendEvent} from '../analytics/event'
import {getActiveTab} from '../utils/getActiveTab'
import {getSyncedSetting} from '../utils/getSyncedSetting'
import {Story} from '../utils/story'

import {onInstallAndUpdate} from './onInstallAndUpdate'
import {SlugManager} from './slugManager'


const manifestData = chrome.runtime.getManifest()
Sentry.init({
  dsn: 'https://966b241d3d57856bd13a0945fa9fa162@o49777.ingest.sentry.io/4506624214368256',
  release: manifestData.version,
  environment: process.env.NODE_ENV
})


if (typeof self !== 'undefined' && self instanceof ServiceWorkerGlobalScope) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'callOpenAI') {
      callOpenAI(request.data.prompt, sender.tab!.id).then(response => {
        if (response) {
          sendResponse({data: response})
        }
      }).catch(e => {
        console.error('Error calling OpenAI:', e)
        sendResponse({error: e})
        chrome.runtime.sendMessage({message: 'OpenAIResponseFailed'})
      })
      return true // Keep the message channel open for the async response
    }
    if (request.message === 'getOpenAiToken') {
      getOpenAiToken().then(token => {
        sendResponse({token: token})
      })
      return true
    }
    if (request.action === 'getSavedNotes') {
      Story.notes().then(value => {
        sendResponse({data: value})
      })
      return true
    }
  })
}

async function handleCommands(command: string) {
  const activeTab = await getActiveTab()
  if (!activeTab || !activeTab.id) {
    return
  }
  if (command === 'change-state') {
    await chrome.tabs.sendMessage(activeTab.id, {message: 'change-state'})
  } else if (command === 'change-iteration') {
    await chrome.tabs.sendMessage(activeTab.id, {message: 'change-iteration'})
  } else if (command === 'copy-git-branch') {
    await chrome.tabs.sendMessage(activeTab.id, {message: 'copy-git-branch'})
  }
}

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
