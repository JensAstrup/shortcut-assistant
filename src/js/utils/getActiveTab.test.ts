import {getActiveTab} from './getActiveTab';
import Tab = chrome.tabs.Tab;


describe('getActiveTab', () => {
    it('returns active tab if exists', async () => {
        const expectedTab: Tab = {
            autoDiscardable: false,
            discarded: false,
            groupId: 0,
            incognito: false,
            selected: false,
            id: 1,
            windowId: 1,
            index: 0,
            title: 'Tab 1',
            pinned: false,
            highlighted: false,
            active: true
        };
        chrome.tabs.query = jest.fn().mockImplementation((queryInfo, callback) => {
            if (typeof callback === 'function') {
                callback([expectedTab]);
            }
            return [expectedTab]
        })
        const result: chrome.tabs.Tab | undefined = await getActiveTab();
        expect(chrome.tabs.query).toHaveBeenCalledWith({active: true, currentWindow: true});
        expect(result).toEqual(expectedTab);
    });

    it('rejects if runtime error occurs', async () => {
        // @ts-ignore
        chrome.tabs.query.mockRejectedValue(new Error('Runtime error'));
        await expect(getActiveTab()).rejects.toThrow('Runtime error');
    });

    it('rejects if no active tab found', async () => {
        // @ts-ignore
        chrome.tabs.query.mockResolvedValue([]);
        await expect(getActiveTab()).rejects.toThrow('No active tab found');
    });
});
