import {storyPageIsReady} from "./utils";


function findFirstMatchingElementForState(state) {
    // Get all elements with the class 'value'
    const elementsWithValueClass = document.querySelectorAll('.value');

    for (const element of elementsWithValueClass) {
        // Check if any child element contains the text 'In Development'
        const child = Array.from(element.children).find(child => child.innerHTML === state);

        // If such a child is found, return the element and the child
        if (child) {
            return {element, child};
        }
    }
    // Return null if no matching element is found
    return null;
}

/**
 * Parses a given date string in the format Shortcut uses (ex. Dec 9 2023, 4:28 pm)
 * and returns the corresponding Date object.
 *
 * @param {string} dateString - The date string to parse. Should be in the format "Month Day Year HH:MM AM/PM".
 * @return {Date} - The parsed Date object.
 */
function parseDate(dateString) {
    const timePart = dateString.match(/(\d+):(\d+) (am|pm)/i);
    if (!timePart) return new Date(dateString);

    let [, hours, minutes, ampm] = timePart;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    if (ampm.toLowerCase() === 'pm' && hours < 12) {
        hours += 12;
    } else if (ampm.toLowerCase() === 'am' && hours === 12) {
        hours = 0;
    }

    const adjustedDateStr = dateString.replace(/(\d+):(\d+) (am|pm)/i, `${hours}:${minutes}`);

    return new Date(adjustedDateStr);
}


function hoursBetweenExcludingWeekends(startDateStr) {
    const startDate = parseDate(startDateStr);
    const now = new Date();

    let hours = 0;
    let currentDate = new Date(startDate);
    while (currentDate < now) {
        // If the day is not Saturday (6) or Sunday (0), add hours
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
            hours += 24; // Add 24 hours for each weekday
        }
        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Subtract the fractional day hours for the start and end days
    hours -= startDate.getHours() + startDate.getMinutes() / 60;
    hours -= 24 - (now.getHours() + now.getMinutes() / 60);

    return hours;
}

function isInState(state) {
    let storyState = ''
    try {
        const storyStateDiv = document.querySelector('.story-state')
        storyState = storyStateDiv.querySelector('.value').textContent
    } catch (e) {

    }
    return storyState === state;
}

/**
 * Calculates the time spent in a given state.
 *
 * @param {string} state - The state for which to calculate the time spent.
 * @returns {number} - The time spent in the state in hours, excluding weekends.
 */
export function getTimeInState(state){
    let latestUpdateElements = findFirstMatchingElementForState(state)
    let stateDiv = document.querySelector('.story-state')
    let stateSpan = stateDiv.querySelector('.value')
    while(latestUpdateElements === null){
        latestUpdateElements = findFirstMatchingElementForState(state)
        if(stateSpan !== null && stateSpan.textContent !== state){
            return null
        }
    }
    const parentDiv = latestUpdateElements.element.parentElement
    const dateElement = parentDiv.querySelector('.date')
    return hoursBetweenExcludingWeekends(dateElement.innerHTML)
}

export async function checkDevelopmentTime() {
    await storyPageIsReady()
    const inDevelopment = isInState('In Development')
    const inReview = isInState('Ready for Review')
    if (!inDevelopment && !inReview) {
        return
    }
    let hoursElapsed = getTimeInState('In Development')
    const alertHours = inDevelopment ? (2 * 24) : inReview ? (3 * 24) : 0;
    if (hoursElapsed > (alertHours + 24)) {
        addEmojiToTitle('🚨')
    }
    else if (hoursElapsed >= alertHours) {
        addEmojiToTitle('⚠️')
    }
    if(inDevelopment){
        const stateDiv = document.querySelector('.story-state')
        const stateSpan = stateDiv.querySelector('.value')
        const daysElapsed = hoursElapsed / 24;
        stateSpan.textContent = `${stateSpan.textContent} (${daysElapsed.toFixed(2)} days)`
    }
    if(inReview){
        hoursElapsed = getTimeInState('Ready for Review')
        const stateDiv = document.querySelector('.story-state')
        const stateSpan = stateDiv.querySelector('.value')
        const daysElapsed = hoursElapsed / 24;
        stateSpan.textContent = `${stateSpan.textContent} (${daysElapsed.toFixed(2)} days)`
    }

}

function addEmojiToTitle(emoji) {
    const storyTitle = document.querySelector('.story-name');
    if (!storyTitle.textContent.includes(emoji)) {
        storyTitle.innerHTML = `${emoji} ${storyTitle.innerHTML}`;
    }
}

chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        if (request.message === 'initDevelopmentTime') {
            if (request.url.includes('story')) {
                await checkDevelopmentTime();
            }
        }
    });