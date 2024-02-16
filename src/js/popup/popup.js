import {sleep} from '../utils/utils'

const saveButton = document.getElementById('saveKeyButton')
const analyzeButton = document.getElementById('analyzeButton')
const stalledWorkCheckbox = document.getElementById('stalledWorkToggle')
const todoistCheckbox = document.getElementById('todoistOptions')


export async function setOpenAIToken(){
    const openAIToken = document.getElementById('openAIToken').value
    await chrome.storage.local.set({'openAIToken': openAIToken})
}

async function saveOptions(){
    const enableStalledWorkWarnings = stalledWorkCheckbox.checked
    const enableTodoistOptions = todoistCheckbox.checked
    await chrome.storage.sync.set({'enableStalledWorkWarnings': enableStalledWorkWarnings})
    await chrome.storage.sync.set({'enableTodoistOptions': enableTodoistOptions})
}

export async function saveButtonClicked(){
    saveButton.disabled = true
    const openAIToken = document.getElementById('openAIToken').value
    if (openAIToken !== '') {
        await setOpenAIToken(openAIToken)
    }
    await saveOptions()
    saveButton.disabled = false
    analyzeButton.disabled = false
    saveButton.textContent = 'Saved!'
    await sleep(3000)
    saveButton.textContent = 'Save'
}

export function setSectionDisplay(tabToShow, sectionToShow, tabToHide, sectionToHide){
    tabToShow.addEventListener('click', function (e){
        e.preventDefault()
        sectionToShow.classList.remove('hidden')
        sectionToHide.classList.add('hidden')
        tabToShow.classList.add('tab-active')
        tabToHide.classList.remove('tab-active')
    })
}

// tailwind.config = {
//     darkMode: 'class'
// }
