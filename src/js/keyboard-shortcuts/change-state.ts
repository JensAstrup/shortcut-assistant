import sleep from '../utils/sleep'


async function changeState(): Promise<void> {
  const dropdownParent: null | HTMLElement = document.getElementById('story-dialog-state-dropdown')
  if (!dropdownParent) {
    console.error('The state dropdown was not found.')
    return
  }
  const dropdown: HTMLButtonElement | null = dropdownParent.querySelector('[data-toggle="true"]')
  if (dropdown) {
    dropdown.click()
    const dropdownPopup: null | HTMLElement = document.querySelector('[data-state="active"]')
    if (!dropdownPopup) {
      console.error('The dropdown popup was not found.')
      return
    }
    const inputParent: HTMLElement | null = document.querySelector('[data-perma-id="popover"]')
    if (!inputParent) {
      console.error('The input parent was not found.')
      return
    }
    const input: HTMLInputElement | null = inputParent.querySelector('[type="search"]')
    if (input) {
      await sleep(100)
      input.value = ''
      input.focus()
    }
  }
}

export default changeState
