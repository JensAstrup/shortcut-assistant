/**
 * @jest-environment jsdom
 */

import {extractStoryDescription} from '../../../js/analyze/contentScript'


describe('extractStoryDescription tests', () => {
    let elem = document.createElement('div');

    beforeAll(() => {
        elem.setAttribute('data-key', 'description');
        document.body.appendChild(elem);
    });

    afterEach(() => {
        elem.textContent = '';
    });

    afterAll(() => {
        document.body.removeChild(elem);
    });

    test('Validates that extractStoryDescription retrieves correct story description', () => {
        const testDescription = 'This is a test description.';
        elem.textContent = testDescription;
        const result = extractStoryDescription();

        expect(result).toEqual(testDescription);
    });

    test('Validates that extractStoryDescription returns an empty string when no description is set', () => {
        const result = extractStoryDescription();
        expect(result).toEqual('');
    });
});