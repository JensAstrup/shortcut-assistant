import {getStateDiv} from '@sx/utils/get-state-div'
import {getSyncedSetting} from '@sx/utils/get-synced-setting'
import sleep from '@sx/utils/sleep'

import changeState from './change-state'
import copyGitBranch from './copy-git-branch'



async function copyBranchAndMoveToInDevelopment(): Promise<void> {
  chrome.runtime.sendMessage({action: 'sendEvent', data: {eventName: 'copy_git_branch_and_move_to_in_development'}})
  await copyGitBranch(false)
  await changeState()
  await sleep(300)
  const inDevelopmentText = await getSyncedSetting('inDevelopmentText', 'In Development')
  const stateDiv = getStateDiv(inDevelopmentText)
  if (stateDiv) {
    stateDiv.click()
  }
}

export default copyBranchAndMoveToInDevelopment
