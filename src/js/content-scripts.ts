import * as Sentry from '@sentry/browser'

import {analyzeStoryDescription} from './analyze/analyze-story-description'
import {CycleTime} from './cycle-time/cycle-time'
import {DevelopmentTime} from './development-time/development-time'
import {KeyboardShortcuts} from './keyboard/keyboardShortcuts'
import {NotesButton} from './notes/notesButton'
import {Todoist} from './todoist/Todoist'
import {getSyncedSetting} from './utils/getSyncedSetting'
import {logError} from './utils/logError'
import storyPageIsReady from './utils/storyPageIsReady'


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
      new Todoist()
    }
  } catch (e) {
    console.error(e)
  }
  new NotesButton()
  new KeyboardShortcuts().activate()

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
    new Todoist()
  }
  const shortcuts = new KeyboardShortcuts()
  if (request.message === 'change-state') {
    await shortcuts.changeState()
  }
  if (request.message === 'change-iteration') {
    await shortcuts.changeIteration()
  }
  if (request.message === 'copy-git-branch') {
    await shortcuts.copyGitBranch()
  }
}

chrome.runtime.onMessage.addListener(handleMessage)
