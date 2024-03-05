import {Story} from '../utils/story'
import storyPageIsReady from '../utils/storyPageIsReady'


export class DevelopmentTime{
    static setTimeSpan(hoursElapsed){
        const stateDiv = document.querySelector('.story-state')
        const stateSpan = stateDiv.querySelector('.value')
        let daysElapsed = hoursElapsed / 24
        if (hoursElapsed < 48) {
            // Was seeing odd behavior where additional days were being added to the final count.
            // While unable to determine the exact cause, it was happening only for hours less than 48.
            // This is a hacky temporary fix to prevent the issue from occurring.
            daysElapsed -= 1
        }
        daysElapsed = Math.abs(daysElapsed)
        stateSpan.textContent = `${stateSpan.textContent} (${daysElapsed.toFixed(2)} days)`
    }

    static async set(){
        await storyPageIsReady()
        const inDevelopment = Story.isInState('In Development')
        const inReview = Story.isInState('Ready for Review')
        if (!inDevelopment && !inReview) {
            return
        }

        if (inDevelopment) {
            let hoursElapsed = Story.getTimeInState('In Development', false)
            this.setTimeSpan(hoursElapsed)
        }
        if (inReview) {
            let hoursElapsed = Story.getTimeInState('Ready for Review', true)
            this.setTimeSpan(hoursElapsed)
        }
    }
}
