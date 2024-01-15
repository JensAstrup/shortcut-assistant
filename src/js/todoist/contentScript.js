import {getDescriptionButtonContainer} from '../utils';


function extractStoryTitle() {
    const titleDiv = document.querySelector('.story-name');
    return titleDiv.textContent
}
async function setTaskButton(title, tooltip, taskTitle){
    const newButton = document.createElement('button');
    newButton.className = 'action edit-description add-task micro flat-white';
    newButton.dataset.tabindex = '';
    newButton.dataset.tooltip = tooltip;
    newButton.dataset.key = title;
    newButton.tabIndex = 2;

    const storyTitle = extractStoryTitle();
    const storyLink = window.location.href
    if(taskTitle === undefined){
        taskTitle = `${title} [${storyTitle}](${storyLink})`
    }
    else{
        taskTitle = `${taskTitle} [${storyTitle}](${storyLink})`
    }
    newButton.addEventListener('click', function(){
        window.open(`https://todoist.com/add?content=${taskTitle}`, '_blank');
    });

    const span = document.createElement('span');
    span.className = 'fa fa-plus';
    newButton.appendChild(span);
    newButton.append(' ' + title + '   ');

    const container = await getDescriptionButtonContainer()
    const existingButton = document.querySelector(`[data-key="${title}]"`);
    if (!existingButton) {
        container.appendChild(newButton);
    }
}

export async function initTodos(){
    if (window.location.href.includes('story')) {
        setTaskButton('Work on', 'Set task to work on story');
        setTaskButton('Review', 'Set task to review story');
        setTaskButton('Follow up', 'Set task to follow up on story', 'Follow up on');
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "initTodos" && request.url.includes('story')) {
        initTodos()
    }
});
