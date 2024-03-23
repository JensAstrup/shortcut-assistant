import {Story} from '../utils/story'
import storyPageIsReady from '../utils/storyPageIsReady'


export class DevelopmentTime {
  static setTimeSpan(hoursElapsed) {
    const stateDiv = document.querySelector('.story-state')
    const stateSpan = stateDiv.querySelector('.value')
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
      let hoursElapsed = Story.getTimeInState('In Development')
      this.setTimeSpan(hoursElapsed)
    }
    if (inReview) {
      let hoursElapsed = Story.getTimeInState('Ready for Review')
      this.setTimeSpan(hoursElapsed)
    }
  }
}
