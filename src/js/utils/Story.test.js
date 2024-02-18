/**
 * @jest-environment jsdom
 */
import {Story} from './story'


describe('Story Class', () => {
    test('get description', () => {
        document.body.innerHTML = `<div data-key="description">Sample Description</div>`

        expect(Story.description).toEqual('Sample Description')
    })
})