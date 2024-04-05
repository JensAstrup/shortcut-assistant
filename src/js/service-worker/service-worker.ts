import * as Sentry from '@sentry/browser'

import callOpenAI from '../ai/call-openai'
import getOpenAiToken from '../ai/get-openai-token'
import {sendEvent} from '../analytics/event'
import {getActiveTab} from '../utils/getActiveTab'
import {getSyncedSetting} from '../utils/getSyncedSetting'
import {Story} from '../utils/story'

import {onInstallAndUpdate} from './on-install-and-update'
import {SlugManager} from './slug-manager'


const manifestData = chrome.runtime.getManifest()
Sentry.init({
  dsn: 'https://966b241d3d57856bd13a0945fa9fa162@o49777.ingest.sentry.io/4506624214368256',
  release: manifestData.version,
  environment: process.env.NODE_ENV
})

async function handleOpenAICall(prompt: string, tabId: number): Promise<{ data: any } | { error: any }> {
  try {
    const response = await callOpenAI(prompt, tabId)
    return {data: response}
  } catch (e) {
    console.error('Error calling OpenAI:', e)
    chrome.runtime.sendMessage({message: 'OpenAIResponseFailed'})
    return {error: e}
  }
}

async function handleGetOpenAiToken(): Promise<{ token: string }> {
  const token = await getOpenAiToken()
  return {token}
}

async function handleGetSavedNotes(): Promise<{ data: string | null }> {
  const value = await Story.notes()
  return {data: value}
}

if (typeof self !== 'undefined' && self instanceof ServiceWorkerGlobalScope) {
  chrome.runtime.onMessage.addListener((request: {
    action?: string,
    data?: { prompt: string }
    message?: string,
  }, sender: chrome.runtime.MessageSender, sendResponse: (response: unknown) => void) => {
    if (request.action === 'callOpenAI' && request.data) {
      if (!sender.tab || !sender.tab.id) {
        return
      }
      handleOpenAICall(request.data.prompt, sender.tab.id).then(sendResponse)
      return true // Keep the message channel open for the async response
    }

    if (request.message === 'getOpenAiToken') {
      handleGetOpenAiToken().then(sendResponse)
      return true
    }

    if (request.action === 'getSavedNotes') {
      handleGetSavedNotes().then(sendResponse)
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
