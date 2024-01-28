/**
 * @jest-environment jsdom
 */

import { isInState } from './contentScript';

describe("isInState function", () => {
  // mock the document.querySelector function
  document.querySelector = jest.fn((selector) => {
    if (selector === ".story-state") {
      return {
        querySelector: jest.fn(() => ({
          textContent: 'TestState',
        })),
      };
    }
    return null;
  });

  test("returns true if the state is same as the story state", () => {
    const state = "TestState";
    expect(isInState(state)).toBe(true);
  });

  test("returns false if the state is not same as the story state", () => {
    const state = "DifferentState";
    expect(isInState(state)).toBe(false);
  });

  test("returns false if the story state cannot be found", () => {
    document.querySelector = jest.fn(() => null);
    const state = "TestState";
    expect(isInState(state)).toBe(false);
  });
});