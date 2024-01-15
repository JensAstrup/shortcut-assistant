import {getDescriptionButtonContainer, logError} from '../utils';


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

async function setNoteContentIfDataExists(){
    const response = await chrome.runtime.sendMessage({action: 'getSavedNotes'})
    if(response.data !== undefined && response.data !== ''){
        setNoteContentExistsNotice().catch(logError)
    }
}

export async function initNotes(){
    if (window.location.href.includes('story')) {
        setNoteContentIfDataExists().catch(logError)
    }
}

chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        if (request.message === 'initNotes' && request.url.includes('story') ){
            if(request.data === undefined || request.data === ''){
                return
            }
            setNoteContentExistsNotice().catch(logError)
        }
    }
)