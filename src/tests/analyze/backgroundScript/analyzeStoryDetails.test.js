describe('analyzeStoryDetails', () => {
    let originalChrome;
    let analyzeButton;

    beforeEach(() => {
        // Mock the chrome.tabs.query and chrome.tabs.sendMessage
        originalChrome = global.chrome;
        global.chrome = {
            tabs: {
                query: jest.fn((queryInfo, callback) => {
                    callback([{id: 123}]);
                }),
                sendMessage: jest.fn()
            }
        };

        // Mock the document.getElementById and its return value
        analyzeButton = { textContent: '' };
        document.getElementById = jest.fn().mockReturnValue(analyzeButton);
    });

    afterEach(() => {
        // Restore the original chrome object
        global.chrome = originalChrome;
    });

    test('should change analyze button text to "Analyzing..."', async () => {
        await analyzeStoryDetails();
        expect(analyzeButton.textContent).toBe('Analyzing...');
    });

    test('should call chrome.tabs.query with correct parameters', async () => {
        await analyzeStoryDetails();
        expect(chrome.tabs.query).toHaveBeenCalledWith({active: true, currentWindow: true}, expect.any(Function));
    });

    test('should send a message to the active tab', async () => {
        await analyzeStoryDetails();
        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(123, {message: 'analyzeStoryDescription'});
    });

    // Additional tests for sendEvent function if it's part of your codebase
});
