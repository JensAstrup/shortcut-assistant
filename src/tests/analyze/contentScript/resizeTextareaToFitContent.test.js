/**
 * @jest-environment jsdom
 */

import {resizeTextareaToFitContent} from '../../../js/analyze/contentScript'


describe('resizeTextareaToFitContent tests', () => {
    test('Validates that resizeTextareaToFitContent sets correct height', () => {
        const mockTextarea = {
            style: {},
            _scrollHeight: 100,
            get scrollHeight() {
                return this._scrollHeight;
            },
            set scrollHeight(value) {
                this._scrollHeight = value;
            }
        };

        resizeTextareaToFitContent(mockTextarea);

        expect(mockTextarea.style.height).toEqual('100px');
    });
});