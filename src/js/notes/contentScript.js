async function setNoteContentExistsNotice(){
    const newButton = document.createElement('button');
    newButton.className = 'action edit-description view-notes micro flat-white';
    newButton.dataset.tabindex = '';
    newButton.dataset.tooltip = 'Tip: shift-click the description to edit';
    newButton.tabIndex = 2;

    // Create and append the span element
    const span = document.createElement('span');
    span.className = 'fa fa-pencil';
    newButton.appendChild(span);

    // Add the text to the button
    newButton.append(' View Notes');

    // Append the new button to the same container
    let container = document.querySelector('.description-container');
    let attempts = 0
    while(container === null){
        await new Promise(resolve => setTimeout(resolve, 1000));
        container = document.querySelector('.description-container');
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

chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        console.log('Receiving message')
        console.log(request.message)
        if (request.message === 'setNotes'){
            if(request.data === undefined){
                return
            }
            console.log('received valid message')
            await setNoteContentExistsNotice()
        }
    }
)