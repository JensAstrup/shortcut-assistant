export function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export async function storyPageIsReady(){
    let storyTitle = document.querySelector('.story-name')
    while(storyTitle === null){
        await sleep(1000);
        storyTitle = document.querySelector('.story-name');
    }
    return true;
}

export async function getDescriptionButtonContainer() {
    let descriptionButton = document.querySelector(`[data-on-click="App.Controller.Story.editDescription"]`);
    let container = descriptionButton?.parentElement
    let attempts = 0
    while (container === null) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        descriptionButton = document.querySelector(`[data-on-click="App.Controller.Story.editDescription"]`);
        container = descriptionButton?.parentElement
        attempts++;
        if (attempts > 10) {
            break;
        }
    }
    return container;
}
