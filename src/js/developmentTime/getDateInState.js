import {findFirstMatchingElementForState} from "./findFirstMatchingElementForState";

export function getDateInState(state) {
    let latestUpdateElements = findFirstMatchingElementForState(state);
    if (!latestUpdateElements) {
        return null;
    }

    const parentDiv = latestUpdateElements.element.parentElement;
    const dateElement = parentDiv.querySelector('.date');
    return dateElement ? dateElement.innerHTML : null;
}


