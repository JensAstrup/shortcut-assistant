import {findFirstMatchingElementForState} from "./findFirstMatchingElementForState";

export function getDateInState(state) {
    // Assuming findFirstMatchingElementForState attempts to find the first element that matches the given state.
    // Ensure this function returns null if no matching element is found.
    let latestUpdateElements = findFirstMatchingElementForState(state);
    if (!latestUpdateElements) {
        return null; // Immediately return null if no elements match the state.
    }

    // Check if the stateSpan's textContent matches the provided state.
    // This check appears to be redundant given the logic, considering removal or clarification of intent.
    let stateDiv = document.querySelector('.story-state');
    if (stateDiv) {
        let stateSpan = stateDiv.querySelector('.value');
        if (stateSpan && stateSpan.textContent !== state) {
            return null;
        }
    }

    // Assuming latestUpdateElements is now guaranteed to be non-null and has the expected structure.
    const parentDiv = latestUpdateElements.element.parentElement;
    const dateElement = parentDiv.querySelector('.date');
    return dateElement ? dateElement.innerHTML : null; // Safeguard against null dateElement.
}