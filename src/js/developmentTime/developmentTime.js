import {Story} from '../utils/story'
import {storyPageIsReady} from '../utils/utils'


export class DevelopmentTime{
    static setTimeSpan(hoursElapsed){
        const stateDiv = document.querySelector('.story-state')
        const stateSpan = stateDiv.querySelector('.value')
        let daysElapsed = hoursElapsed / 24
        if (hoursElapsed < 48) {
            daysElapsed -= 1
        }
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