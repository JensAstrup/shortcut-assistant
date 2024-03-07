import dayjs from 'dayjs'
import {findFirstMatchingElementForState} from '../developmentTime/findFirstMatchingElementForState'
import {hoursBetweenExcludingWeekends} from './hoursBetweenExcludingWeekends'


export class Story {
  static get title(): string | null {
    const titleDiv = document.querySelector('.story-name')
    const title = titleDiv?.textContent
    if (!title) {
      return null
    }
    return title
  }

  static get description(): string | null {
    const descriptionDiv = document.querySelector('[data-key="description"]')
    const description = descriptionDiv?.textContent
    if (!description) {
      return null
    }
    return description
  }

  /**
   * Calculates the time spent in a given state.
   *
   * @param {string} state - The state for which to calculate the time spent.
   * @param {boolean} now - Whether to consider the current datetime as the end date
   * @returns {number} - The time spent in the state in hours, excluding weekends.
   */
  static getTimeInState(state: string, now: boolean = false): number {
    if (now) {
      const now = dayjs()
      const nowFormatted = now.format('MMM D YYYY, h:mm A')
      return hoursBetweenExcludingWeekends(this.getDateInState(state), nowFormatted)
    }
    const dateElement = this.getDateInState(state)
    if (dateElement === null || dateElement === undefined) {
      console.warn(`Could not find date element for state ${state}`)
      return 0
    }
    return hoursBetweenExcludingWeekends(dateElement)
  }

  static getDateInState(state: string) {
    let latestUpdateElements = findFirstMatchingElementForState(state)
    if (!latestUpdateElements) {
      return null
    }

    const parentDiv = latestUpdateElements.element.parentElement
    const dateElement = parentDiv.querySelector('.date')
    return dateElement ? dateElement.innerHTML : null
  }

  static isInState(state: string) {
    let storyState = ''
    try {
      const storyStateDiv = document.querySelector('.story-state')
      storyState = storyStateDiv?.querySelector('.value')?.textContent || ''
    } catch (e) {
      console.warn(`Could not find state element for state ${state}`)
    }
    return storyState === state
  }
}
