import Openai from '../__mocks__/openai'
// import {getOpenAiToken} from './getOpenAiToken'
import OpenAI, {mockOpenAI} from 'openai'
import {getOpenAiToken} from './getOpenAiToken'
import {fetchCompletion} from './fetchCompletion'


jest.mock('./getOpenAiToken', () => ({
    getOpenAiToken: jest.fn().mockResolvedValue('test-token')
}))


describe('fetchCompletion', () => {
    const mockTabId = 123
    const mockDescription = 'Test description'
    const mockToken = 'test-token'
    const mockStreamData = [
        {choices: [{delta: {content: 'response'}}]},
        {choices: [{delta: {content: 'response'}}]}
    ]

    beforeAll(() => {
        global.chrome = {
            tabs: {
                sendMessage: jest.fn()
            },
            runtime: {
                sendMessage: jest.fn()
            }
        }
    })

    beforeEach(() => {
        jest.clearAllMocks()
        OpenAI.mockClear()
        getOpenAiToken.mockResolvedValue(mockToken)

        // OpenAI.mock.instances[0].chat.completions.create.mockResolvedValue(mockStream);
    });

    it('retrieves OpenAI token and calls OpenAI API with correct parameters', async () => {

        await fetchCompletion(mockDescription, mockTabId)

        expect(getOpenAiToken).toHaveBeenCalledTimes(1)
        expect(OpenAI).toHaveBeenCalledWith({apiKey: mockToken})
        expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
            messages: [{role: 'system', content: expect.any(String)}, {
                role: 'user',
                content: mockDescription
            }],
            model: 'gpt-4-turbo-preview',
            stream: true
        })
    })

    it('sends messages to tab during stream', async () => {
        await fetchCompletion(mockDescription, mockTabId)

        for (let data of mockStreamData) {
            expect(global.chrome.tabs.sendMessage).toHaveBeenCalledWith(mockTabId, {
                type: 'updateOpenAiResponse',
                'data': data.choices[0].delta.content
            })
        }
    });

    it('sends a completion message when the OpenAI response is completed', async () => {
        await fetchCompletion(mockDescription, mockTabId)

        expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({type: 'OpenAIResponseCompleted'})
    });
});
