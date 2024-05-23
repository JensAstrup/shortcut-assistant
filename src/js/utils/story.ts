import * as Sentry from '@sentry/browser'
import dayjs from 'dayjs'

import scope from '@sx/utils/sentry'

import {findFirstMatchingElementForState} from '../development-time/find-first-matching-element-for-state'

import {getActiveTabUrl} from './get-active-tab-url'
import {hoursBetweenExcludingWeekends} from './hours-between-excluding-weekends'
import sleep from './sleep'


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
    const descriptionDiv: Element | null = document.querySelector('#story-description-v2')
    const description: string | null | undefined = descriptionDiv?.textContent
    if (!description) {
      return null
    }
    return description
  }

  static async notes(): Promise<string | null> {
    const storyId = await Story.id()
    if (!storyId) {
      return null
    }
    const key = 'notes_' + storyId
    const result = await chrome.storage.sync.get(key)
    if (result[key] === undefined) {
      return null
    }
    return result[key]
  }

  static async id(): Promise<string | null> {
    const url = await getActiveTabUrl()
    const match = url?.match(/\/story\/(\d+)/)
    if (!match) {
      return null
    }
    return match[1]
  }

  private buttonExists(identifier: string) {
    return document.querySelector(`button[data-${identifier}="true"]`)
  }

  public async addButton(newButton: HTMLButtonElement, identifier: string) {
    const existingButton = this.buttonExists(identifier)
    if (!existingButton) {
      const container = await Story.getEditDescriptionButtonContainer()
      container?.appendChild(newButton)
    }
    // Prevent duplicate buttons
    const TWO_SECONDS = 2000
    sleep(TWO_SECONDS).then(() => {
      const existingButtons = document.querySelectorAll(`button[data-${identifier}="true"]`)
      if (existingButtons.length > 1) {
        existingButtons[0].remove()
      }
    })
  }

  static async getEditDescriptionButtonContainer(): Promise<HTMLElement | null | undefined> {
    let container: HTMLElement | null | undefined
    let attempts = 0
    while (!container) {
      const ONE_SECOND = 1000
      await sleep(ONE_SECOND)
      container = document.querySelector('#story-description-v2') as HTMLElement
      attempts++
      const MAX_ATTEMPTS = 10
      if (attempts > MAX_ATTEMPTS) {
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
    const dateInState = this.getDateInState(state)
    if (!dateInState) {
      return null
    }
    return hoursBetweenExcludingWeekends(dateInState, nowFormatted)
  }

  static getDateInState(state: string): string | null {
    const latestUpdateElements = findFirstMatchingElementForState(state)
    if (!latestUpdateElements) {
      return null
    }

    const parentDiv = latestUpdateElements.element.parentElement
    const dateElement = parentDiv?.querySelector('.date')
    return dateElement ? dateElement.innerHTML : null
  }

  static get state(): HTMLElement | null {
    const storyStateDiv: HTMLElement | null = document.getElementById('story-dialog-state-dropdown')
    if (!storyStateDiv) {
      return null
    }
    return storyStateDiv.querySelector('.value')
  }

  static isInState(state: string): boolean {
    let storyState = ''
    try {
      storyState = this.state?.textContent || ''
    }
    catch (e) {
      console.warn(`Could not find state element for state ${state}`)
      scope.captureException(e)
    }
    return storyState.includes(state)
  }
}
