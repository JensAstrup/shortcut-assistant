import {getDescriptionButtonContainer, logError} from '../utils';


function extractStoryTitle() {
    const titleDiv = document.querySelector('.story-name');
    return titleDiv.textContent
}

function createButton(tooltip, title) {
    const newButton = document.createElement('button');
    newButton.className = 'action edit-description add-task micro flat-white';
    newButton.dataset.tabindex = '';
    newButton.dataset.tooltip = tooltip;
    newButton.dataset.key = title;
    newButton.tabIndex = 2;
    return newButton;
}

function createTooltipText(taskTitle, title) {
    const storyTitle = extractStoryTitle();
    const storyLink = window.location.href
    if (taskTitle === undefined) {
        return `${title} [${storyTitle}](${storyLink})`
    }
    else {
        return `${taskTitle} [${storyTitle}](${storyLink})`
    }
}

async function addButtonIfNotExists(title, newButton) {
    const container = await getDescriptionButtonContainer()
    const existingButton = document.querySelector(`[data-key="${title}]"`);
    if (!existingButton) {
        container.appendChild(newButton);
    }
}

async function setTaskButton(title, tooltip, taskTitle){
    const newButton = createButton(tooltip, title);

    taskTitle = createTooltipText(taskTitle, title);
    newButton.addEventListener('click', function(){
        window.open(`https://todoist.com/add?content=${taskTitle}`, '_blank');
    });

    const span = document.createElement('span');
    span.className = 'fa fa-plus';
    newButton.appendChild(span);
    newButton.append(' ' + title + '   ');

    addButtonIfNotExists(title, newButton).catch(logError);
}

export async function initTodos(){
    if (window.location.href.includes('story')) {
        setTaskButton('Work on', 'Set task to work on story').catch(logError);
        setTaskButton('Review', 'Set task to review story').catch(logError);
        setTaskButton('Follow up', 'Set task to follow up on story', 'Follow up on').catch(logError);
    }
}
