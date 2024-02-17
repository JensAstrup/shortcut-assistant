global.chrome = {
    tabs: {
        query: jest.fn((queryInfo, callback) => {
            callback([{url: 'http://example.com/story/12345'}])
        }),
        onUpdated: {
            addListener: jest.fn()
        },
        sendMessage: jest.fn()
    },
    runtime: {
        lastError: null,
        onInstalled: {
            addListener: jest.fn()
        },
        getManifest: jest.fn().mockImplementation(() => {
            return {
                version: '1.0.0'
            }
        }),
        sendMessage: jest.fn()
    },
    windows: {
        create: jest.fn()
    },
    storage: {
        sync: {
            set: jest.fn().mockImplementation((value) => {
                return new Promise((resolve) => resolve())
            })
        }
    },
    action: {
        setBadgeText: jest.fn().mockImplementation((details) => {
            return new Promise((resolve) => resolve())
        }),
        setBadgeBackgroundColor: jest.fn().mockImplementation((details) => {
            return new Promise((resolve) => resolve())
        }),
        getBadgeText: jest.fn(),
        getBadgeBackgroundColor: jest.fn()
    }
}
global.tailwind = {
    config: {}
}
