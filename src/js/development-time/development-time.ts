import {Story} from '../utils/story'
import storyPageIsReady from '../utils/story-page-is-ready'


export class DevelopmentTime {
  static setTimeSpan(hoursElapsed: number): void {
    const stateSpan = Story.state
    if (!stateSpan) {
      throw new Error('Story state span not found')
    }
    let daysElapsed = hoursElapsed / 24
    daysElapsed = Math.abs(daysElapsed)
    const timeSpan = document.createElement('span')
    timeSpan.setAttribute('data-assistant', 'true')
    timeSpan.innerHTML = ` (${daysElapsed.toFixed(2)} days)`
    stateSpan.appendChild(timeSpan)
  }

  static remove() {
    const timeSpan = document.querySelector('[data-assistant="true"]')
    if (timeSpan) {
      timeSpan.remove()
    }
  }

  static async set() {
    await storyPageIsReady()
    this.remove()
    const inDevelopment = Story.isInState('In Development')
    const inReview = Story.isInState('Ready for Review')
    if (!inDevelopment && !inReview) {
      return
    }

    if (inDevelopment) {
      const hoursElapsed = Story.getTimeInState('In Development')
      if (hoursElapsed) {
        this.setTimeSpan(hoursElapsed)
      }
    }
    if (inReview) {
      const hoursElapsed = Story.getTimeInState('Ready for Review')
      if (hoursElapsed) {
        this.setTimeSpan(hoursElapsed)
      }
    }
  }
}
