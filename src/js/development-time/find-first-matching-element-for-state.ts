export function findFirstMatchingElementForState(state: string) {
  // Get all elements with the class 'value'
  const elementsWithValueClass= document.querySelectorAll('.value')

  for (const element of elementsWithValueClass) {
    // Check if any child element contains the text 'In Development'
    const child = Array.from(element.children).find(child => child.innerHTML === state)

    // If such a child is found, return the element and the child
    if (child) {
      return {element, child}
    }
  }
  return null
}
