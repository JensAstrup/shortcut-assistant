import {Story} from '../utils/story'
import storyPageIsReady from '../utils/storyPageIsReady'


export class DevelopmentTime{
    static setTimeSpan(hoursElapsed){
        const stateDiv = document.querySelector('.story-state')
        const stateSpan = stateDiv.querySelector('.value')
        let daysElapsed = hoursElapsed / 24
        daysElapsed = Math.abs(daysElapsed)
        stateSpan.textContent = `${stateSpan.textContent} (${daysElapsed.toFixed(2)} days)`
    }

  static async set(attempts = 0) {
        await storyPageIsReady()
        const inDevelopment = Story.isInState('In Development')
        const inReview = Story.isInState('Ready for Review')
        if (!inDevelopment && !inReview) {
            return
        }

        if (inDevelopment) {
          let hoursElapsed = Story.getTimeInState('In Development')
          if (hoursElapsed === null && attempts < 2) {
            await this.set(attempts + 1)
          }
            this.setTimeSpan(hoursElapsed)
        }
        if (inReview) {
          let hoursElapsed = Story.getTimeInState('Ready for Review')
          if (hoursElapsed === null && attempts < 2) {
            await this.set(attempts + 1)
          }
            this.setTimeSpan(hoursElapsed)
        }
    }
}
