import {getStateDiv} from '../utils/get-state-div'
import sleep from '../utils/sleep'

import changeState from './change-state'
import copyGitBranch from './copy-git-branch'


async function copyBranchAndMoveToInDevelopment(): Promise<void> {
  await copyGitBranch()
  await changeState()
  await sleep(300)
  const stateDiv = getStateDiv('In Development')
  if (stateDiv) {
    stateDiv.click()
  }
}

export default copyBranchAndMoveToInDevelopment
