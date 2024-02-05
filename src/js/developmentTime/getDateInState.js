import {findFirstMatchingElementForState} from "./findFirstMatchingElementForState";

export function getDateInState(state) {
    let latestUpdateElements = findFirstMatchingElementForState(state);
    if (!latestUpdateElements) {
        return null;
    }

    let stateDiv = document.querySelector('.story-state');
    if (stateDiv) {
        let stateSpan = stateDiv.querySelector('.value');
        if (stateSpan && stateSpan.textContent !== state) {
            return null;
        }
    }

    const parentDiv = latestUpdateElements.element.parentElement;
    const dateElement = parentDiv.querySelector('.date');
    return dateElement ? dateElement.innerHTML : null; // Safeguard against null dateElement.
}