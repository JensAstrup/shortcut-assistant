/**
 * @jest-environment jsdom
*/
import {findFirstMatchingElementForState} from '../developmentTime/findFirstMatchingElementForState'
import {Story} from './story'


describe('Story.description', () => {
  test('get title', () => {
    document.body.innerHTML = `<div class="story-name">Sample Title</div>`
    expect(Story.title).toEqual('Sample Title')
  })

    test('get description', () => {
        document.body.innerHTML = `<div data-key="description">Sample Description</div>`
        expect(Story.description).toEqual('Sample Description')
    })
})


jest.mock('../developmentTime/findFirstMatchingElementForState', () => ({
  findFirstMatchingElementForState: jest.fn(),
}));

describe('Story.getDateInState', () => {
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

    const result = Story.getDateInCurrentState('NonExistentState');
    expect(result).toBeNull();
  });

  test('returns null when state span text does not match provided state', () => {
    findFirstMatchingElementForState.mockReturnValueOnce({ element: document.querySelector('.latest-update .element') });

    const result = Story.getDateInCurrentState('MismatchState');
    expect(result).toBeNull();
  });

  test('returns the date when state matches and date element exists', () => {
    const latestUpdateElement = document.querySelector('.latest-update .element');
    findFirstMatchingElementForState.mockReturnValueOnce({ element: latestUpdateElement });

    const result = Story.getDateInCurrentState('ExpectedState');
    expect(result).toBe('2022-01-01');
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
});



describe("isInState function", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="story-state">
        <span class="value">TestState</span>
      </div>
    `;
  });

  test("returns true if the state is same as the story state", () => {
    const state = "TestState";
    expect(Story.isInState(state)).toBe(true);
  });

  test("returns false if the state is not same as the story state", () => {
    const state = "DifferentState";
    expect(Story.isInState(state)).toBe(false);
  });

  test("returns false if the story state cannot be found", () => {
    document.querySelector = jest.fn(() => null);
    const state = "TestState";
    expect(Story.isInState(state)).toBe(false);
  });
});
