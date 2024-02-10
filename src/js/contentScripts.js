import {initTodos} from './todoist/contentScript'
import {logError, sleep} from './utils'
import {getSyncedSetting} from './serviceWorker/utils'
import {setCycleTime} from './cycleTime/contentScript'
import {checkDevelopmentTime} from './developmentTime/contentScript'
import {analyzeStoryDescription} from './analyze/contentScript'
import {setNoteContentIfDataExists} from './notes/contentScript'
import * as Sentry from '@sentry/browser'

const manifestData = chrome.runtime.getManifest()
Sentry.init({
    dsn: 'https://966b241d3d57856bd13a0945fa9fa162@o49777.ingest.sentry.io/4506624214368256',
    release: manifestData.version,
    environment: process.env.NODE_ENV,
})


async function activate() {
    await sleep(3000)

    setCycleTime().catch((error) => {
        console.error(error)
    })

    const enableStalledWorkWarnings = await getSyncedSetting('enableStalledWorkWarnings', true)
    if (enableStalledWorkWarnings) {
        checkDevelopmentTime().catch((error) => {
            console.error(error)
        })
    }
    const enableTodoistOptions = await getSyncedSetting('enableTodoistOptions', false)
    if (enableTodoistOptions) {
        initTodos().catch((error) => {
            console.error(error)
        })
    }
    setNoteContentIfDataExists().catch((error) => {
        console.error(error)
    })
}

chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        const activeTabUrl = window.location.href
        if (request.message === 'initDevelopmentTime' && request.url.includes('story')) {
            checkDevelopmentTime().catch(logError)
            setCycleTime().catch(logError)
        }
        if (request.message === 'analyzeStoryDescription') {
            await analyzeStoryDescription(activeTabUrl)
        }
        if (request.message === 'initNotes' && request.url.includes('story')) {
            setNoteContentIfDataExists(request.data).catch(logError)
        }
        if (request.message === 'initTodos' && request.url.includes('story')) {
            initTodos().catch(logError)
        }
    })

activate()
