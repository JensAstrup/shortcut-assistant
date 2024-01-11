import {sleep} from "./utils";

const saveButton = document.getElementById('saveKeyButton');
const analyzeButton = document.getElementById('analyzeButton');
saveButton.addEventListener('click', async function() {
    saveButton.disabled = true
    const openAIToken = document.getElementById('openAIToken').value;
    const enableStalledWorkWarnings = document.getElementById('stalledWorkToggle').checked;
    const enableTodoistOptions = document.getElementById('todoistOptions').checked;
    await chrome.storage.local.set({'openAIToken': openAIToken })
    await chrome.storage.sync.set({'enableStalledWorkWarnings': enableStalledWorkWarnings })
    await chrome.storage.sync.set({'enableTodoistOptions': enableTodoistOptions })
    saveButton.disabled = false
    analyzeButton.disabled = false
    saveButton.textContent = 'Saved!'
    await sleep(3000)
    saveButton.textContent = 'Save'
});

document.addEventListener('DOMContentLoaded', function() {
    const tabActions = document.getElementById('tabActions');
    const tabSettings = document.getElementById('tabSettings');
    const actionsSection = document.getElementById('actionsSection');
    const settingsSection = document.getElementById('settingsSection');

    tabActions.addEventListener('click', function(e) {
        e.preventDefault();
        actionsSection.classList.remove('hidden');
        settingsSection.classList.add('hidden');
        tabActions.classList.add('-mb-px');
        tabSettings.classList.remove('-mb-px');
    });

    tabSettings.addEventListener('click', function(e) {
        e.preventDefault();
        settingsSection.classList.remove('hidden');
        actionsSection.classList.add('hidden');
        tabSettings.classList.add('-mb-px');
        tabActions.classList.remove('-mb-px');
    });
    chrome.runtime.sendMessage({message: 'getOpenAiToken'}, response => {
        if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
            return;
        }
        const openAiToken = response.token;
        if(openAiToken === undefined){
            analyzeButton.disabled = true
        }
    });
});



tailwind.config = {
    darkMode: 'class',
}