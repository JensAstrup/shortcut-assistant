import {getTimeInState, isInState} from '../developmentTime';
import {storyPageIsReady} from '../utils';


export async function setCycleTime(){
    await storyPageIsReady()
    const isCompleted = isInState('Completed')
    if(!isCompleted){
        return;
    }
    const hoursInDevelopment = getTimeInState('In Development')
    const hoursInReview = getTimeInState('Ready for Review')

    const storyCreatedDiv = document.querySelector('.story-date-created')
    const storyCreatedDivParent = storyCreatedDiv.parentElement

    // Generate new div for story date cycle time
    const cycleTimeDiv = document.createElement('div');

    cycleTimeDiv.style.paddingTop = "0"
    cycleTimeDiv.style.marginTop = "0"
    cycleTimeDiv.className = "attribute story-date-cycle-time";
    const cycleTimeHours = hoursInDevelopment + hoursInReview;
    const cycleTimeDisplay = cycleTimeHours > 24 ? `${(cycleTimeHours / 24).toFixed(2)} days` : `${cycleTimeHours.toFixed(2)} hours`
    cycleTimeDiv.innerHTML = `
        <span class='name'>Cycle Time</span>
        <span class='value'>${cycleTimeDisplay}</span>`;
    storyCreatedDivParent.insertBefore(cycleTimeDiv, storyCreatedDiv);

}

chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        if (request.message === 'initDevelopmentTime') {
            if (request.url.includes('story')) {
                await setCycleTime();
            }
        }
    });