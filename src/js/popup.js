import {sleep} from "./utils";
import {getSyncedSetting} from './serviceWorker/utils';

const saveButton = document.getElementById('saveKeyButton');
const analyzeButton = document.getElementById('analyzeButton');
const stalledWorkCheckbox = document.getElementById('stalledWorkToggle');
const todoistCheckbox = document.getElementById('todoistOptions');

saveButton.addEventListener('click', async function() {
    saveButton.disabled = true
    const openAIToken = document.getElementById('openAIToken').value;
    const enableStalledWorkWarnings = stalledWorkCheckbox.checked;
    const enableTodoistOptions = todoistCheckbox.checked;
    await chrome.storage.local.set({'openAIToken': openAIToken })
    await chrome.storage.sync.set({'enableStalledWorkWarnings': enableStalledWorkWarnings })
    await chrome.storage.sync.set({'enableTodoistOptions': enableTodoistOptions })
    saveButton.disabled = false
    analyzeButton.disabled = false
    saveButton.textContent = 'Saved!'
    await sleep(3000)
    saveButton.textContent = 'Save'
});


function setSectionDisplay(tabToShow, sectionToShow, tabToHide, sectionToHide) {
    tabToShow.addEventListener('click', function(e) {
        e.preventDefault();
        sectionToShow.classList.remove('hidden');
        sectionToHide.classList.add('hidden');
        tabToShow.classList.add('-mb-px');
        tabToHide.classList.remove('-mb-px');
    });
}


document.addEventListener('DOMContentLoaded', async function() {
    const tabActions = document.getElementById('tabActions');
    const tabSettings = document.getElementById('tabSettings');
    const actionsSection = document.getElementById('actionsSection');
    const settingsSection = document.getElementById('settingsSection');

    const enableStalledWorkWarnings = await getSyncedSetting('enableStalledWorkWarnings', true)
    const enableTodoistOptions = await getSyncedSetting('enableTodoistOptions', false)

    stalledWorkCheckbox.checked = enableStalledWorkWarnings
    todoistCheckbox.checked = enableTodoistOptions

    setSectionDisplay(tabActions, actionsSection, tabSettings, settingsSection);
    setSectionDisplay(tabSettings, settingsSection, tabActions, actionsSection);
});

tailwind.config = {
    darkMode: 'class',
}