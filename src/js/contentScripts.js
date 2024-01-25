import './analyze/contentScript.js';
import './notes/contentScript.js';
import './todoist/contentScript.js';
import './developmentTime.js'
import {initTodos} from "./todoist/contentScript";
import {sleep} from "./utils";
import {checkDevelopmentTime} from "./developmentTime";
import {getSyncedSetting} from './serviceWorker/utils';

async function activate() {
    await sleep(3000)

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