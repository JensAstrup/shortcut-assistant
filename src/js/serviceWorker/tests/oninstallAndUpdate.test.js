import { onInstall, onUpdate } from '../onInstallAndUpdate';

global.chrome = {
  windows: {
    create: jest.fn(),
  },
  storage: {
    sync: {
      set: jest.fn(),
    }
  }
};

describe('onInstall function', () => {
  beforeEach(() => {
        chrome.windows.create.mockClear();
    });

  test('it sets initial configuration and opens installed.html', () => {
    onInstall();

    expect(chrome.windows.create).toHaveBeenCalledTimes(1);
    expect(chrome.windows.create).toHaveBeenCalledWith({
      url: '../installed.html',
      type: 'popup',
      width: 310,
      height: 500
    });

    expect(chrome.storage.sync.set).toHaveBeenCalledTimes(2);
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({'enableStalledWorkWarnings': true});
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({'enableTodoistOptions': false});
  });
});

describe('onUpdate function', () => {
    beforeEach(() => {
        chrome.windows.create.mockClear();
    });
    test('it opens updated.html', () => {
        onUpdate();

        expect(chrome.windows.create).toHaveBeenCalledTimes(1);
        expect(chrome.windows.create).toHaveBeenCalledWith({
        url: '../updated.html',
        type: 'popup',
        width: 310,
        height: 500
        });
    });
})