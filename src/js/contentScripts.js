import './analyze/contentScript.js';
import './notes/contentScript.js';
import './todoist/contentScript.js';
import './developmentTime.js'
import {initTodos} from "./todoist/contentScript";
import {sleep} from "./utils";
import {checkDevelopmentTime} from "./developmentTime";
import {initNotes} from "./notes/contentScript";

async function activate() {
    await sleep(3000)
    initTodos().catch((error) => {
        console.error(error)
    })
    checkDevelopmentTime().catch((error) => {
        console.error(error)
    })
    initNotes().catch((error) => {
        console.error(error)
    })
}

activate()