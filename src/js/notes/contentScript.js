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

    let descriptionButton = document.querySelector(`[data-on-click="App.Controller.Story.editDescription"]`);
    let container = descriptionButton?.parentElement
    let attempts = 0
    while(container === null){
        await new Promise(resolve => setTimeout(resolve, 1000));
        descriptionButton = document.querySelector(`[data-on-click="App.Controller.Story.editDescription"]`);
        container = descriptionButton?.parentElement
        attempts++;
        if (attempts > 10) {
            break;
        }
    }

    // Check if the button already exists in the container
    const existingButton = container.querySelector('.action.edit-description.view-notes.micro.flat-white');
    if (!existingButton) {
        container.appendChild(newButton);
    }
}

export async function initNotes(){
    if (window.location.href.includes('story')) {
        await setNoteContentExistsNotice()
    }
}

chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        if (request.message === 'initNotes' && request.url.includes('story') ){
            if(request.data === undefined || request.data === ''){
                return
            }
            await setNoteContentExistsNotice()
        }
    }
)