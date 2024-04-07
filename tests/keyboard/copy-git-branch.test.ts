import copyGitBranch from '../../src/js/keyboard-shortcuts/copy-git-branch'

describe('copy git branch', () => {
  beforeAll(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(undefined)
      },
      writable: true
    })
  })

  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('should copy the git branch to the clipboard', async () => {
    const gitHelpers = document.createElement('div')
    gitHelpers.id = 'open-git-helpers-dropdown'
    document.body.appendChild(gitHelpers)

    const gitBranchInput = document.createElement('input')
    gitBranchInput.className = 'git-branch'
    gitBranchInput.value = 'feature/branch-name'
    document.body.appendChild(gitBranchInput)

    await copyGitBranch()
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('feature/branch-name')
  })

  it('should log an error to the console if the git helpers dropdown is not found', async () => {
    console.error = jest.fn()
    await copyGitBranch()
    expect(console.error).toHaveBeenCalledWith('The git helpers dropdown was not found.')
  })

  it('should log an error to the console if the git branch input is not found', async () => {
    console.error = jest.fn()
    const gitHelpers = document.createElement('div')
    gitHelpers.id = 'open-git-helpers-dropdown'
    document.body.appendChild(gitHelpers)

    await copyGitBranch()
    expect(console.error).toHaveBeenCalledWith('The git branch input was not found.')
  })

})
