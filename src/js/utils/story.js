import moment from 'moment'
import {findFirstMatchingElementForState} from '../developmentTime/findFirstMatchingElementForState'
import {hoursBetweenExcludingWeekends} from './hoursBetweenExcludingWeekends'


export class Story{
    static get title() {
        const titleDiv = document.querySelector('.story-name')
        return titleDiv.textContent
    }

    static get description(){
        const descriptionDiv = document.querySelector('[data-key="description"]')
        return descriptionDiv.textContent
    }

    /**
     * Calculates the time spent in a given state.
     *
     * @param {string} state - The state for which to calculate the time spent.
     * @param {boolean} now - Whether to consider the current datetime as the end date
     * @returns {number} - The time spent in the state in hours, excluding weekends.
     */
    static getTimeInState(state, now = false) {
        if (now){
            const now = moment()
            const nowFormatted = now.format('MMM D YYYY, h:mm A')
            return hoursBetweenExcludingWeekends(this.getDateInState(state), nowFormatted)
        }
        const dateElement = this.getDateInCurrentState(state)
        if (dateElement === null || dateElement === undefined){
            console.warn(`Could not find date element for state ${state}`)
            return 0
        }
        return hoursBetweenExcludingWeekends(dateElement)
    }

    static getDateInCurrentState(state) {
        let latestUpdateElements = findFirstMatchingElementForState(state);
        if (!latestUpdateElements) {
            return null;
        }

        let stateDiv = document.querySelector('.story-state');
        if (stateDiv) {
            let stateSpan = stateDiv.querySelector('.value');
            if (stateSpan && stateSpan.textContent !== state) {
                return null;
            }
        }

        const parentDiv = latestUpdateElements.element.parentElement;
        const dateElement = parentDiv.querySelector('.date');
        return dateElement ? dateElement.innerHTML : null
    }

    // TODO: This is likely a duplicate of getDateInCurrentState, remove if so.
    static getDateInState(state) {
        let latestUpdateElements = findFirstMatchingElementForState(state);
        if (!latestUpdateElements) {
            return null;
        }

        const parentDiv = latestUpdateElements.element.parentElement;
        const dateElement = parentDiv.querySelector('.date');
        return dateElement ? dateElement.innerHTML : null;
    }

    static isInState(state) {
        let storyState = ''
        try {
            const storyStateDiv = document.querySelector('.story-state')
            storyState = storyStateDiv.querySelector('.value').textContent
        } catch (e) {

        }
        return storyState === state
    }
}
