global.chrome = {
    tabs: {
        query: jest.fn((queryInfo, callback) => {
            callback([{ url: 'http://example.com/story/12345' }]);
        }),
        onUpdated: {
            addListener: jest.fn(),
        },
    },
    runtime: {
        lastError: null,
        onInstalled: {
            addListener: jest.fn(),
        },
        getManifest: jest.fn().mockImplementation(() => {
            return {
                version: '1.0.0',
            };
        })
    },
};
global.tailwind = {
    config: {},
}
