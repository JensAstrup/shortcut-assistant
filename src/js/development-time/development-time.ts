import {getSyncedSetting} from '@sx/utils/get-synced-setting'
import {Story} from '@sx/utils/story'
import storyPageIsReady from '@sx/utils/story-page-is-ready'


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
    const inDevelopmentText = await getSyncedSetting('inDevelopmentText', 'In Development')
    const inReviewText = await getSyncedSetting('inReviewText', 'Ready for Review')
    const inDevelopment = Story.isInState(inDevelopmentText)
    const inReview = Story.isInState(inReviewText)
    if (!inDevelopment && !inReview) {
      return
    }

    if (inDevelopment) {
      const hoursElapsed = Story.getTimeInState(<string>inDevelopmentText)
      if (hoursElapsed) {
        this.setTimeSpan(hoursElapsed)
      }
    }
    if (inReview) {
      const hoursElapsed = Story.getTimeInState(inReviewText)
      if (hoursElapsed) {
        this.setTimeSpan(hoursElapsed)
      }
    }
  }
}
