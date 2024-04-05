/**
 * @jest-environment jsdom
 */


import {
  findFirstMatchingElementForState
} from '../../src/js/development-time/find-first-matching-element-for-state'

global.chrome = {
    runtime: {
        onMessage: {
            addListener: jest.fn()
        }
    },
    tabs: {
        query: jest.fn()
    }
};


describe('findFirstMatchingElementForState', () => {
    // Mocking the document.querySelectorAll method
    document.querySelectorAll = jest.fn();
    let mockElement = {
        children: [
            { innerHTML: 'In Development' },
            { innerHTML: 'In Production' },
        ]
    };

    it('returns the first element and its child that matches the state', () => {
        document.querySelectorAll.mockReturnValue([mockElement]);
        const result = findFirstMatchingElementForState('In Development');
        expect(result).toEqual({element: mockElement, child: mockElement.children[0]});
    });

    it('returns null if no element matches the state', () => {
        document.querySelectorAll.mockReturnValue([mockElement]);
        const result = findFirstMatchingElementForState('Nonexistent State');
        expect(result).toBeNull();
    });
});
