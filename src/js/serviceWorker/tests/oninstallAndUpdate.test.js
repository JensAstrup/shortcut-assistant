import {onInstall, onUpdate} from '../onInstallAndUpdate'

describe('onInstall function', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        chrome.action.setBadgeText.mockClear()
        chrome.action.setBadgeBackgroundColor.mockClear()
    })

    test('it sets initial configuration and opens installed.html', () => {
        onInstall()

        expect(chrome.windows.create).toHaveBeenCalledTimes(1)
        expect(chrome.windows.create).toHaveBeenCalledWith({
            url: '../html/installed.html',
            type: 'popup',
            width: 310,
            height: 500
        })

        expect(chrome.storage.sync.set).toHaveBeenCalledTimes(2)
        expect(chrome.storage.sync.set).toHaveBeenCalledWith({'enableStalledWorkWarnings': true})
        expect(chrome.storage.sync.set).toHaveBeenCalledWith({'enableTodoistOptions': false})
    })
})

describe('onUpdate function', () => {
    beforeEach(() => {
        chrome.windows.create.mockClear()
    })
    test('it opens updated.html', async () => {
        await onUpdate()

        expect(chrome.action.setBadgeText).toHaveBeenCalledWith({text: ' '})
        expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({color: '#a30000'})
    })
})