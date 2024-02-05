/**
 * @jest-environment jsdom
 */

import {getDateInState} from "./getDateInState";

jest.mock('./findFirstMatchingElementForState', () => ({
  findFirstMatchingElementForState: jest.fn(),
}));

// Import the mocked function
import { findFirstMatchingElementForState } from './findFirstMatchingElementForState';

describe('getDateInState', () => {
  // Setup common DOM structure for the tests
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="story-state">
        <span class="value">ExpectedState</span>
      </div>
      <div class="latest-update">
        <div class="element">
          <div class="date">2022-01-01</div>
        </div>
      </div>
    `;
  });

  test('returns null when no elements match the state', () => {
    findFirstMatchingElementForState.mockReturnValueOnce(null);

    const result = getDateInState('NonExistentState');
    expect(result).toBeNull();
  });

  test('returns null when state span text does not match provided state', () => {
    // Assuming the stateDiv and stateSpan exist but with different state
    findFirstMatchingElementForState.mockReturnValueOnce({ element: document.querySelector('.latest-update .element') });

    const result = getDateInState('MismatchState');
    expect(result).toBeNull();
  });

  test('returns the date when state matches and date element exists', () => {
    const latestUpdateElement = document.querySelector('.latest-update .element');
    findFirstMatchingElementForState.mockReturnValueOnce({ element: latestUpdateElement });

    const result = getDateInState('ExpectedState');
    expect(result).toBe('2022-01-01');
  });

  // Clean up after all tests are done
  afterAll(() => {
    jest.clearAllMocks();
  });
});
