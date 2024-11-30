import { getStateDiv } from '@sx/utils/get-state-div'
import { logError } from '@sx/utils/log-error'
import sleep from '@sx/utils/sleep'
import Workspace from '@sx/workspace/workspace'

import changeState from './change-state'
import copyGitBranch from './copy-git-branch'



async function copyBranchAndMoveToInDevelopment(): Promise<void> {
  chrome.runtime.sendMessage({ action: 'sendEvent', data: { eventName: 'copy_git_branch_and_move_to_in_development' } }).catch(logError)
  await copyGitBranch(false)
  await changeState()
  const WAIT_TIME = 300
  await sleep(WAIT_TIME)
  const states = await Workspace.states()
  const startedState = states.Started[0]
  const stateDiv = getStateDiv(startedState)
  if (stateDiv) {
    stateDiv.click()
  }
}

export default copyBranchAndMoveToInDevelopment
