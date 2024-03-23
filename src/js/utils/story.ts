import dayjs from 'dayjs'
import * as Sentry from '@sentry/browser'
import {findFirstMatchingElementForState} from '../developmentTime/findFirstMatchingElementForState'
import {hoursBetweenExcludingWeekends} from './hoursBetweenExcludingWeekends'
import sleep from "./sleep";
import {getActiveTabUrl} from "./getActiveTabUrl";


export class Story {
    static get title(): string | null {
        const titleDiv: Element | null = document.querySelector('.story-name')
        const title: string | null | undefined = titleDiv?.textContent
        if (!title) {
            return null
        }
        return title
    }

    static get description(): string | null {
        const descriptionDiv: Element | null = document.querySelector('[data-key="description"]')
        const description: string | null | undefined = descriptionDiv?.textContent
        if (!description) {
            return null
        }
        return description
    }

    static async id(): Promise<string | null> {
        const url = await getActiveTabUrl()
        const match = url?.match(/\/story\/(\d+)/)
        return match ? match[1] : null
    }

    static async getEditDescriptionButtonContainer(): Promise<HTMLElement | null | undefined> {
        let descriptionButton: Element | null = document.querySelector(`[data-on-click="App.Controller.Story.editDescription"]`)
        let container: HTMLElement | null | undefined = descriptionButton?.parentElement
        let attempts = 0
        while (container === null) {
            await sleep(1000)
            descriptionButton = document.querySelector(`[data-on-click="App.Controller.Story.editDescription"]`)
            container = descriptionButton?.parentElement
            attempts++
            if (attempts > 10) {
                break
            }
        }
        return container
    }

    /**
     * Calculates the time between a given state and the current time.
     *
     * @param {string} state - The state for which to calculate the time spent.
     * @returns {number} - The time spent in the state in hours, excluding weekends.
     */
    static getTimeInState(state: string): number | null {
        const now = dayjs()
        const nowFormatted = now.format('MMM D YYYY, h:mm A')
        const dateInState = this.getDateInState(state);
        if (!dateInState) {
            return null
        }
        return hoursBetweenExcludingWeekends(dateInState, nowFormatted)
    }

    static getDateInState(state: string): string | null {
        let latestUpdateElements = findFirstMatchingElementForState(state)
        if (!latestUpdateElements) {
            return null
        }

        const parentDiv = latestUpdateElements.element.parentElement
        const dateElement = parentDiv.querySelector('.date')
        return dateElement ? dateElement.innerHTML : null
    }

    static isInState(state: string): boolean {
        let storyState = ''
        try {
            const storyStateDiv: Element | null = document.querySelector('.story-state')
            storyState = storyStateDiv?.querySelector('.value')?.textContent || ''
        } catch (e) {
            console.warn(`Could not find state element for state ${state}`)
            Sentry.captureException(e)
        }
        return storyState.includes(state)
    }
}
