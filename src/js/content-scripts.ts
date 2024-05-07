import * as Sentry from '@sentry/browser'

import {AiFunctions} from '@sx/analyze/ai-functions'

import {analyzeStoryDescription} from './analyze/analyze-story-description'
import {CycleTime} from './cycle-time/cycle-time'
import {DevelopmentTime} from './development-time/development-time'
import changeIteration from './keyboard-shortcuts/change-iteration'
import changeState from './keyboard-shortcuts/change-state'
import copyGitBranch from './keyboard-shortcuts/copy-git-branch'
import {KeyboardShortcuts} from './keyboard-shortcuts/keyboard-shortcuts'
import {NotesButton} from './notes/notes-button'
import {Todoist} from './todoist/todoist'
import {getSyncedSetting} from './utils/get-synced-setting'
import {logError} from './utils/log-error'
import storyPageIsReady from './utils/story-page-is-ready'


const manifestData = chrome.runtime.getManifest()
Sentry.init({
  dsn: 'https://966b241d3d57856bd13a0945fa9fa162@o49777.ingest.sentry.io/4506624214368256',
  release: manifestData.version,
  environment: process.env.NODE_ENV
})


export async function activate() {
  await storyPageIsReady()

  CycleTime.set().catch((error) => {
    console.error(error)
  })

  DevelopmentTime.set().catch((error) => {
    console.error(error)
  })
  try {
    const enableTodoistOptions = await getSyncedSetting('enableTodoistOptions', false)
    if (enableTodoistOptions) {
      // Wait on response because AiFunctions.addAnalyzeButton() will also set a button
      // and async could affect the order
      await Todoist.setTaskButtons()
    }
  }
  catch (e) {
    console.error(e)
  }
  new NotesButton()
  new KeyboardShortcuts().activate()
  AiFunctions.addAnalyzeButton().catch((e) => {
    console.error(e)
    Sentry.captureException(e)
  })

}

export async function handleMessage(request: { message: string, url: string }) {
  const activeTabUrl = window.location.href
  if (request.message === 'initDevelopmentTime' && request.url.includes('story')) {
    DevelopmentTime.set().catch(logError)
    CycleTime.set().catch(logError)
  }
  if (request.message === 'analyzeStoryDescription') {
    await analyzeStoryDescription(activeTabUrl)
  }
  if (request.message === 'initNotes' && request.url.includes('story')) {
    new NotesButton()
  }
  if (request.message === 'initTodos' && request.url.includes('story')) {
    Todoist.setTaskButtons().catch(logError)
  }
  if (request.message === 'change-state') {
    await changeState()
  }
  if (request.message === 'change-iteration') {
    await changeIteration()
  }
  if (request.message === 'copy-git-branch') {
    await copyGitBranch()
  }
}

chrome.runtime.onMessage.addListener(handleMessage)
