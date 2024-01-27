import * as Sentry from '@sentry/browser';
import {getDescriptionButtonContainer, logError} from '../utils';

const manifestData = chrome.runtime.getManifest();
Sentry.init({dsn: 'https://966b241d3d57856bd13a0945fa9fa162@o49777.ingest.sentry.io/4506624214368256',
    release: manifestData.version});

async function setNoteContentExistsNotice(){
    const newButton = document.createElement('button');
    newButton.className = 'action edit-description view-notes micro flat-white';
    newButton.dataset.tabindex = '';
    newButton.dataset.tooltip = 'This story has private notes set';
    newButton.tabIndex = 2;

    const span = document.createElement('span');
    span.className = 'fa fa-pencil';
    newButton.appendChild(span);

    newButton.append(' Has Notes');

    let container = await getDescriptionButtonContainer();

    // Check if the button already exists in the container
    const existingButton = container.querySelector('.action.edit-description.view-notes.micro.flat-white');
    if (!existingButton) {
        container.appendChild(newButton);
    }
}

function removeNotes(){
    const element = document.querySelector('.view-notes')
    if(element !== null){
        element.remove()
    }
}

export async function setNoteContentIfDataExists(data){
    if(data === undefined){
        const response = await chrome.runtime.sendMessage({action: 'getSavedNotes'})
        data = response.data
    }
    if(!data) {
        removeNotes()
    }
    else{
        setNoteContentExistsNotice().catch(logError)
    }
}

export async function initNotes(){
    if (window.location.href.includes('story')) {
        setNoteContentIfDataExists().catch(logError)
    }
}
