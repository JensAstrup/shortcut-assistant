import { getActiveTab } from '../utils';

global.chrome = {
  tabs: {
    query: jest.fn(),
    create: jest.fn()
  },
  runtime: {
    lastError: null
  },
 omnibox: {
    onInputChanged: {
      addListener: jest.fn()
    },
    onInputEntered: {
      addListener: jest.fn()
    }

  }
}

describe('getActiveTab function', () => {
  it('returns the active tab when it exists', async () => {
    const mockTab = { id: 1 };
    chrome.tabs.query.mockImplementation((queryInfo, callback) => callback([mockTab]));
    
    const activeTab = await getActiveTab();
    expect(activeTab).toBe(mockTab);
  });

  it('rejects with runtime error when present', async () => {
    const mockError = new Error('runtime error');
    chrome.runtime.lastError = mockError;
    chrome.tabs.query.mockImplementation((queryInfo, callback) => callback([]));
    
    await expect(getActiveTab()).rejects.toThrow(mockError);
    chrome.runtime.lastError = null;
  });

  it('rejects when there is no active tab', async () => {
    chrome.tabs.query.mockImplementation((queryInfo, callback) => callback([]));
    
    await expect(getActiveTab()).rejects.toThrow("No active tab found");
  });
});