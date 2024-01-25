import {
    findFirstMatchingElementForState, getDateInState,
    getTimeInState,
    hoursBetweenExcludingWeekends,
    isInState
} from '../developmentTime';
import {storyPageIsReady} from '../utils';


export async function setCycleTime(){
    await storyPageIsReady()
    const isCompleted = isInState('Completed')
    if(!isCompleted){
        return;
    }
    const createdDiv = document.querySelector('.story-date-created')
    const createdDateString = getDateInState('In Development')
    const completedDiv = document.querySelector('.story-date-completed')
    const completedDateString = completedDiv.querySelector('.value').innerHTML

    const cycleTimeDiv = document.createElement('div');

    cycleTimeDiv.style.paddingTop = "0"
    cycleTimeDiv.style.marginTop = "0"
    cycleTimeDiv.className = "attribute story-date-cycle-time";
    const cycleTimeHours = hoursBetweenExcludingWeekends(createdDateString, completedDateString)
    const cycleTimeDisplay = cycleTimeHours > 24 ? `${(cycleTimeHours / 24).toFixed(2)} days` : `${cycleTimeHours.toFixed(2)} hours`
    cycleTimeDiv.innerHTML = `
        <span class='name'>Cycle Time</span>
        <span class='value'>${cycleTimeDisplay}</span>`;
    const storyCreatedDivParent = createdDiv.parentElement
    storyCreatedDivParent.insertBefore(cycleTimeDiv, createdDiv);

}

chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        if (request.message === 'initDevelopmentTime') {
            if (request.url.includes('story')) {
                await setCycleTime();
            }
        }
    });