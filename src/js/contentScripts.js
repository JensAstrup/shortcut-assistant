import './analyze/contentScript.js';
import './notes/contentScript.js';
import './todoist/contentScript.js';
import './developmentTime.js'
import {initTodos} from "./todoist/contentScript";
import {sleep} from "./utils";
import {checkDevelopmentTime} from "./developmentTime";
import {setNoteContentExistsNotice} from "./notes/contentScript";

async function activate() {
    await sleep(5000)
    initTodos().catch((error) => {
        console.error(error)
    })
    checkDevelopmentTime().catch((error) => {
        console.error(error)
    })
    setNoteContentExistsNotice().catch((error) => {
        console.error(error)
    })
}

activate()