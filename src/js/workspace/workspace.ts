import _getStates, {ShortcutWorkflowStates} from '@sx/utils/get-states'
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
  async states(fetch?: true): Promise<ShortcutWorkflowStates>
  async states(fetch: false): Promise<ShortcutWorkflowStates | null>
  async states(fetch: boolean = true): Promise<ShortcutWorkflowStates | null> {
    let states: ShortcutWorkflowStates
    const storage = await chrome.storage.local.get('states')
    if (storage.states && storage.states.Started.length > 0) {
      states = storage.states
      if(!fetch) {
        return null
      }
    }
    else if(!fetch) {
      return null
    }
    else {
      states = await _getStates()
    }
    await chrome.storage.local.set({states})
    return states
  }
}
