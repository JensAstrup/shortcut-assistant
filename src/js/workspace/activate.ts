import getStates, {ShortcutWorkflowStates} from '@sx/utils/get-states'
import {logError} from '@sx/utils/log-error'


export class Workspace {
  async activate(): Promise<void> {
    this.states().catch(logError)
  }

  /**
   * Gets the ShortcutWorkflowStates from storage or the Shortcut site. If fetch is false, it will not
   * fetch the states from the Shortcut site if they are not in storage, which is used during
   * initialization when the values themselves are not needed.
   * @param fetch - If false, will not fetch the states from the Shortcut site if it is not in storage.
   */
  async states(fetch: boolean = true): Promise<ShortcutWorkflowStates | null> {
    let states: ShortcutWorkflowStates
    const storage = await chrome.storage.sync.get('states')
    if (storage.states) {
      states = storage.states
    }
    else if(!fetch) {
      return null
    }
    else {
      states = await getStates()
    }
    await chrome.storage.sync.set({states})
    return states
  }
}
