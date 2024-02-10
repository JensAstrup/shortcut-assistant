import moment from 'moment';

import {storyPageIsReady} from '../utils'
import {getDateInCurrentState} from "../utils/dateInCurrentState";


export function hoursBetweenExcludingWeekends(startDateStr, endDateStr) {
    const startDate = moment(startDateStr);
    let endDate = endDateStr ? moment(endDateStr) : moment();

    let hours = 0;
    let currentDate = moment(startDate);
    while (currentDate < endDate) {
        if (currentDate.day() !== 0 && currentDate.day() !== 6) { // 0 is Sunday, 6 is Saturday
            hours += 24;
        }
        currentDate.add(1, 'days');
    }

    if (startDate.day() !== 0 && startDate.day() !== 6) {
        hours -= startDate.hours() + startDate.minutes() / 60;
    }

    if (endDate.day() !== 0 && endDate.day() !== 6) {
        hours += endDate.hours() + endDate.minutes() / 60;
    }

    return hours;
}

export function isInState(state) {
    let storyState = ''
    try {
        const storyStateDiv = document.querySelector('.story-state')
        storyState = storyStateDiv.querySelector('.value').textContent
    } catch (e) {

    }
    return storyState === state
}


/**
 * Calculates the time spent in a given state.
 *
 * @param {string} state - The state for which to calculate the time spent.
 * @returns {number} - The time spent in the state in hours, excluding weekends.
 */
export function getTimeInState(state, now = false) {
    if (now){
        const now = moment()
        const nowFormatted = now.format('MMM D YYYY, h:mm A')
        return hoursBetweenExcludingWeekends(getDateInState(state), nowFormatted)
    }
    const dateElement = getDateInCurrentState(state)
    if (dateElement === null || dateElement === undefined){
        console.warn(`Could not find date element for state ${state}`)
        return 0
    }
    return hoursBetweenExcludingWeekends(dateElement)
}

export async function checkDevelopmentTime() {
    await storyPageIsReady()
    const inDevelopment = isInState('In Development')
    const inReview = isInState('Ready for Review')
    if (!inDevelopment && !inReview) {
        return
    }

    if (inDevelopment) {
        let hoursElapsed = getTimeInState('In Development', false)
        const stateDiv = document.querySelector('.story-state')
        const stateSpan = stateDiv.querySelector('.value')
        let daysElapsed
        if(hoursElapsed < 48){
            daysElapsed = 0
        }
        else{
            daysElapsed = hoursElapsed / 24
        }
        stateSpan.textContent = `${stateSpan.textContent} (${daysElapsed.toFixed(2)} days)`
    }
    if (inReview) {
        let hoursElapsed = getTimeInState('Ready for Review', true)
        const stateDiv = document.querySelector('.story-state')
        const stateSpan = stateDiv.querySelector('.value')
        let daysElapsed = hoursElapsed / 24
        if(hoursElapsed < 48){
            daysElapsed -= 1
        }
        stateSpan.textContent = `${stateSpan.textContent} (${daysElapsed.toFixed(2)} days)`
    }

}


