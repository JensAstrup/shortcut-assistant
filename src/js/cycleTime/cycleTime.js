import {hoursBetweenExcludingWeekends} from '../utils/hoursBetweenExcludingWeekends'
import {Story} from '../utils/story'
import {storyPageIsReady} from '../utils/storyPageIsReady'


export class CycleTime {

  static clear() {
    const cycleTimeDiv = document.querySelector('.story-date-cycle-time')
    if (cycleTimeDiv) {
      cycleTimeDiv.remove()
    }
  }

  static async set() {
    await storyPageIsReady()
    this.clear()
    const isCompleted = Story.isInState('Completed')
    if (!isCompleted) {
      return
    }
    const createdDiv = document.querySelector('.story-date-created')
    const inDevelopmentDateString = Story.getDateInState('In Development')
    const completedDiv = document.querySelector('.story-date-completed')
    const completedDateString = completedDiv.querySelector('.value').innerHTML

    const cycleTimeDiv = document.createElement('div')

    cycleTimeDiv.style.paddingTop = '0'
    cycleTimeDiv.style.marginTop = '0'
    cycleTimeDiv.className = 'attribute story-date-cycle-time'
    const cycleTimeHours = hoursBetweenExcludingWeekends(inDevelopmentDateString, completedDateString)

    if (isNaN(cycleTimeHours)) return

    const cycleTimeDisplay = cycleTimeHours > 24 ? `${(cycleTimeHours / 24).toFixed(2)} days` : `${cycleTimeHours.toFixed(2)} hours`
    cycleTimeDiv.innerHTML = `
            <span class='name'>Cycle Time</span>
            <span class='value'>${cycleTimeDisplay}</span>`
    const storyCreatedDivParent = createdDiv.parentElement
    storyCreatedDivParent.insertBefore(cycleTimeDiv, createdDiv)
  }
}
