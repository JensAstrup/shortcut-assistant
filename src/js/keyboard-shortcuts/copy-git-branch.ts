async function copyGitBranch(track?: boolean): Promise<void> {
  if (track === undefined || track) {
    chrome.runtime.sendMessage({action: 'sendEvent', data: {eventName: 'copy_git_branch'}})
  }
  const gitHelpers = document.getElementById('open-git-helpers-dropdown')
  if (!gitHelpers) {
    console.error('The git helpers dropdown was not found.')
    return
  }
  gitHelpers.click()
  const gitBranchInput: HTMLInputElement | null = document.querySelector('.git-branch')
  if (!gitBranchInput) {
    console.error('The git branch input was not found.')
    return
  }
  const branchName = gitBranchInput.value
  await navigator.clipboard.writeText(branchName)
  gitHelpers.click()
}

export default copyGitBranch
