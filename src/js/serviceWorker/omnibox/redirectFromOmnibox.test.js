/**
 * @jest-environment jsdom
 */

import {redirectFromOmnibox} from './omnibox'

// Global mock for chrome.tabs
global.chrome = {
    tabs: {
        update: jest.fn(),
        create: jest.fn()
    }
}

describe('redirectFromOmnibox', () => {

    afterEach(() => {
        global.chrome.tabs.update.mockReset()
        global.chrome.tabs.create.mockReset()
    })

    it('should update the current tab with the correct URL when the disposition is currentTab', () => {
        const text = 'test'
        const disposition = 'currentTab'

        const expectedUrl = {url: `https://app.shortcut.com/search#${encodeURIComponent(text)}`}

        redirectFromOmnibox(text, disposition)
        expect(global.chrome.tabs.update).toHaveBeenCalledWith(expectedUrl)
    })

    it('should create a new foreground tab with the correct URL when the disposition is newForegroundTab', () => {
        const text = 'test'
        const disposition = 'newForegroundTab'

        const expectedUrl = {url: `https://app.shortcut.com/search#${encodeURIComponent(text)}`}

        redirectFromOmnibox(text, disposition)
        expect(global.chrome.tabs.create).toHaveBeenCalledWith(expectedUrl)
    })

    it('should create a new background tab with the correct URL when the disposition is newBackgroundTab', () => {
        const text = 'test'
        const disposition = 'newBackgroundTab'

        const expectedUrl = {
            url: `https://app.shortcut.com/search#${encodeURIComponent(text)}`,
            active: false
        }

        redirectFromOmnibox(text, disposition)
        expect(global.chrome.tabs.create).toHaveBeenCalledWith(expectedUrl)
    })

    it('should update the tab with the correct url when the disposition is unknown', () => {
        const text = 'test'
        const disposition = 'unknown'

        const expectedUrl = {url: `https://app.shortcut.com/search#${encodeURIComponent(text)}`}

        redirectFromOmnibox(text, disposition)
        expect(global.chrome.tabs.update).toHaveBeenCalledWith(expectedUrl)
    })
})