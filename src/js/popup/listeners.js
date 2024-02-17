import {popupLoaded, trackPopupViewEvent} from './popupLoaded'
import {saveButtonClicked} from './popup'


document.addEventListener('DOMContentLoaded', async function (){
    await popupLoaded()
})

window.addEventListener('load', async () => {
    await trackPopupViewEvent()
})

const saveButton = document.getElementById('saveKeyButton')
saveButton.addEventListener('click', async function (){
    await saveButtonClicked()
})

const changelogButton = document.getElementById('changelog')
changelogButton.addEventListener('click', async function (){
    await chrome.action.setBadgeText({text: ''})
    // await chrome.action.setBadgeBackgroundColor({color: ''})
})
