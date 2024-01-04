function extractStoryTitle() {
    const titleDiv = document.querySelector('.story-name');
    return titleDiv.textContent
}
async function setTaskButton(title, tooltip){
    const newButton = document.createElement('button');
    newButton.className = 'action edit-description add-task micro flat-white';
    newButton.dataset.tabindex = '';
    newButton.dataset.tooltip = tooltip;
    newButton.dataset.key = title;
    newButton.tabIndex = 2;

    const storyTitle = extractStoryTitle();
    const storyLink = window.location.href
    const taskTitle = `${title} [${storyTitle}](${storyLink})`
    newButton.addEventListener('click', function(){
        window.open(`https://todoist.com/add?content=${taskTitle}`, '_blank');
    });

    // Create and append the span element
    const span = document.createElement('span');
    span.className = 'fa fa-plus';
    newButton.appendChild(span);
    newButton.append(' ' + title + '   ');

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
    const existingButton = document.querySelector(`[data-key="${title}]"`);
    if (!existingButton) {
        container.appendChild(newButton);
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "initTodos" && request.url.includes('story')) {
        setTaskButton('Work on', 'Set task to work on story');
        setTaskButton('Review', 'Set task to review story');
        setTaskButton('Follow up', 'Set task to follow up on story');
    }
});
