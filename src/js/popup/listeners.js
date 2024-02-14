import {popupLoaded, trackPopupViewEvent} from './popupLoaded'
import {saveButtonClicked} from './popup'


document.addEventListener('DOMContentLoaded', async function (){
    await popupLoaded()
})

window.addEventListener('load', async () => {
    await trackPopupViewEvent()
})

saveButton.addEventListener('click', async function (){
    await saveButtonClicked()
})