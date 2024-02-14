/**
 * @jest-environment jsdom
 */

import {setOpenAIToken} from './popup.js'

global.chrome = {
    runtime: {
        onMessage: {
            addListener: jest.fn()
        }
    },
    tabs: {
        query: jest.fn()
    },
    storage: {
        local: {
            set: jest.fn()
        }
    }
}

describe('Testing setOpenAIToken', () => {
    beforeEach(() => {
        document.getElementById = jest.fn((id) => {
            switch (id) {
                case 'saveKeyButton':
                    return {
                        addEventListener: jest.fn(),
                        click: jest.fn()
                    }
                case 'openAIToken':
                    return {value: 'mocktoken'}
                case 'stalledWorkToggle':
                    return {checked: false}
                case 'todoistOptions':
                    return {checked: false}
                default:
                    return null
            }
        })
    })
    afterEach(() => {
        chrome.storage.local.set.mockClear()
    })

    it('should pass the correct value to the storage method', async () => {
        await setOpenAIToken()
        const expectedToken = {'openAIToken': 'mocktoken'}
        expect(chrome.storage.local.set).toHaveBeenCalledWith(expectedToken)
    })
})