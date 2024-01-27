import './analyze/contentScript.js';
import './cycleTime/contentScript.js';
import './notes/contentScript.js';
import './todoist/contentScript.js';
import {initTodos} from "./todoist/contentScript";
import {sleep} from "./utils";
import {getSyncedSetting} from './serviceWorker/utils';
import {setCycleTime} from './cycleTime/contentScript';
import {checkDevelopmentTime} from './developmentTime/contentScript'


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

activate()