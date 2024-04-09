function findDivWithText(element: HTMLElement, searchText: string) {
  // Check if current element is a div and matches the searchText
  if (element.tagName === 'DIV' && element.innerText.trim() === searchText) {
    return true
  }
  // Otherwise, recurse through all child elements
  for (const child of element.children) {
    if (findDivWithText(<HTMLElement>child, searchText)) {
      return true
    }
  }
  return false
}

function getStateDiv(text: string): HTMLElement | null {
  const parentDiv: HTMLElement | null = document.querySelector('[data-perma-id="popover"]')
  if (parentDiv) {
    const childDivs: Iterable<HTMLElement> = parentDiv.querySelectorAll('li') as Iterable<HTMLElement>
    for (const div of childDivs) {
      if (findDivWithText(div, text)) {
        return div
      }
    }
  } else {
    console.error('The parent div with class "list apply-on-click" was not found.')
  }
  return null
}

export {getStateDiv}
