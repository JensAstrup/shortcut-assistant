import {getStateDiv} from '../utils/get-state-div'

import changeState from './change-state'
import copyGitBranch from './copy-git-branch'

async function copyBranchAndMoveToInDevelopment(): Promise<void> {
  await copyGitBranch()
  changeState().then(() => {
    const stateDiv = getStateDiv('In Development')
    if (stateDiv) {
      stateDiv.click()
    }
  })
}

export default copyBranchAndMoveToInDevelopment
