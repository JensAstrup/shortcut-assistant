import {initTodos} from "./todoist/contentScript";
import {logError, sleep} from './utils'
import {getSyncedSetting} from './serviceWorker/utils';
import {setCycleTime} from './cycleTime/contentScript';
import {checkDevelopmentTime} from './developmentTime/contentScript'
import {analyzeStoryDescription} from './analyze/contentScript'


async function activate() {
    await sleep(3000)

    await setCycleTime()

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
}

chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        const activeTabUrl = window.location.href
        if (request.message === 'initDevelopmentTime') {
            if (request.url.includes('story')) {
                await checkDevelopmentTime()
                await setCycleTime();
            }
        }
        if (request.message === 'analyzeStoryDescription') {
            await analyzeStoryDescription(activeTabUrl);
        }
        if (request.message === 'initNotes' && request.url.includes('story') ){
            setNoteContentIfDataExists(request.data).catch(logError)
        }
        if (request.message === "initTodos" && request.url.includes('story')) {
            initTodos().catch(logError)
        }
    })

activate()