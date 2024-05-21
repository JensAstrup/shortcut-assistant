import {Story} from '@sx/utils/story'
import storyPageIsReady from '@sx/utils/story-page-is-ready'
import {Workspace} from '@sx/workspace/workspace'


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
    const workspace = new Workspace()
    const states = await workspace.states()
    const inDevelopmentStates = states.Started
    const inDevelopment = await Story.isInState('Started')
    if (!inDevelopment) {
      return
    }
    let inDevelopmentTime: number = 0
    for(const state of inDevelopmentStates){
      inDevelopmentTime += Story.getTimeInState(state) || 0
    }

    if (inDevelopment) {
      if (inDevelopmentTime) {
        this.setTimeSpan(inDevelopmentTime)
      }
    }
  }
}
