/**
 * Gets all the text content from an element and its children.
 * @param element
 */
export function getAllInnerText(element: HTMLElement): string {
  let textContent = ''

  function getText(node: ChildNode): void {
    if (node.nodeType === Node.TEXT_NODE) {
      textContent += node.textContent?.trim() + ' '
    }
    else if (node.nodeType === Node.ELEMENT_NODE) {
      node.childNodes.forEach(getText)
    }
  }

  element.childNodes.forEach(getText)

  return textContent.trim()
}
