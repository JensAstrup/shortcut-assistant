function getStateDiv(text: string): HTMLElement | null {
  const parentDiv: HTMLElement | null = document.querySelector('.list.apply-on-click')
  if (parentDiv) {
    const childDivs: Iterable<HTMLElement> = parentDiv.querySelectorAll('div[data-i]') as unknown as Iterable<HTMLElement>
    for (const div of childDivs) {
      if (div.innerText.trim() === text) {
        return div
      }
    }
  } else {
    console.error('The parent div with class "list apply-on-click" was not found.')
  }
  return null
}

export {getStateDiv}
