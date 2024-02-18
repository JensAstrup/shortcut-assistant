/**
 * @jest-environment jsdom
 */


// Mocking the external modules
jest.mock('../utils/utils', () => ({
  storyPageIsReady: jest.fn()
}));
jest.mock('../utils/hoursBetweenExcludingWeekends', () => ({
  hoursBetweenExcludingWeekends: jest.fn(),
}));
jest.mock('../utils/story', () => ({
    Story: {
        isInState: jest.fn(),
        getDateInState: jest.fn(),
    }
}))


import {hoursBetweenExcludingWeekends} from '../utils/hoursBetweenExcludingWeekends'
import {Story} from '../utils/story'
import { setCycleTime } from './contentScript'; // Adjust the import path as necessary
import { storyPageIsReady } from '../utils/utils';

describe('setCycleTime function', () => {
  let createdDiv, completedDiv, storyCreatedDivParent;

  beforeEach(() => {
    storyPageIsReady.mockClear();
    document.querySelector = jest.fn().mockImplementation(selector => {
      if (selector === '.story-date-cycle-time') return null; // simulate absence initially
      if (selector === '.story-date-created') return createdDiv;
      if (selector === '.story-date-completed') return completedDiv;
    });
    document.createElement = jest.fn().mockImplementation(() => {
      return {
        style: {},
        className: '',
        innerHTML: '',
      };
    });

    // Setup DOM elements mock
    createdDiv = {
      parentElement: {
        insertBefore: jest.fn(),
      },
    };
    completedDiv = {
      querySelector: jest.fn().mockReturnValue({ innerHTML: '2022-09-23' }),
    };
    storyCreatedDivParent = createdDiv.parentElement;
  });

  it('should not display cycle time when the story is not completed', async () => {
    Story.isInState.mockReturnValue(false);

    await setCycleTime();

    expect(storyPageIsReady).toHaveBeenCalledTimes(1);
    expect(Story.isInState).toHaveBeenCalledWith('Completed');
    expect(storyCreatedDivParent.insertBefore).not.toHaveBeenCalled();
  });

  it('should calculate and display cycle time when the story is completed', async () => {
    Story.isInState.mockReturnValue(true);
    Story.getDateInState.mockReturnValue('2022-08-23');
    hoursBetweenExcludingWeekends.mockReturnValue(48); // Simulate 48 hours difference

    await setCycleTime();

    expect(storyPageIsReady).toHaveBeenCalledTimes(1);
    expect(Story.isInState).toHaveBeenCalledWith('Completed');
    expect(Story.getDateInState).toHaveBeenCalledWith('In Development');
    expect(hoursBetweenExcludingWeekends).toHaveBeenCalledWith('2022-08-23', '2022-09-23');
    expect(document.createElement).toHaveBeenCalledWith('div');
    expect(storyCreatedDivParent.insertBefore).toHaveBeenCalledTimes(1); // Ensure the div was inserted
  });
});
