import {getActiveTabUrl} from '../../js/service_worker';


global.chrome = {
    runtime: {
        lastError: null
    },
    tabs: {
        query: jest.fn()
    }
};

describe('getActiveTabUrl', () => {
    it('should resolve with active tab URL', async () => {
        chrome.tabs.query.mockImplementation((queryInfo, callback) => {
            callback([{url: 'http://example.com'}]);
        });

        await expect(getActiveTabUrl()).resolves.toBe('http://example.com');
    });

    it('should reject if there is a lastError', async () => {
        chrome.tabs.query.mockImplementation((queryInfo, callback) => {
            global.chrome.runtime.lastError = new Error('Error message');
            callback([]);
            global.chrome.runtime.lastError = null;
        });

        await expect(getActiveTabUrl()).rejects.toThrow('Error message');
    });

    it('should reject if no active tabs are found', async () => {
        chrome.tabs.query.mockImplementation((queryInfo, callback) => {
            callback([]);
        });

        await expect(getActiveTabUrl()).rejects.toThrow('No active tab found');
    });
});
