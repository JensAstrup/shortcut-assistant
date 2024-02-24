/**
 * @jest-environment jsdom
 */
import {sendEvent} from '../analytics/event'
import * as eventModule from '../analytics/event'
import * as utilsModule from '../utils/utils'
import {AiFunctions} from './aiFunctions'

jest.mock('../analytics/event', () => ({
    sendEvent: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('../utils/utils', () => ({
    sleep: jest.fn().mockResolvedValue(undefined)
}))

global.chrome = {
    tabs: {
        query: jest.fn().mockImplementation((queryInfo, callback) => {
            callback([{id: 1}])
        }),
        sendMessage: jest.fn()
    }
}

function setupDOM(){
    document.body.innerHTML = `
    <div id="analyzeButton">
    <span id="loadingSpan"></span>
    </div>
    <div id="analyzeText"></div>
    <div id="errorState"></div>
  `
}

describe('OpenAI class', () => {
    beforeEach(() => {
        setupDOM()
        jest.clearAllMocks()
    })

    describe('analyzeStoryDetails', () => {
        it('should append loading spinner and send message to active tab', async () => {
            await AiFunctions.analyzeStoryDetails()

            const loadingSpan = document.getElementById('loadingSpan')
            expect(loadingSpan).not.toBeNull()
            expect(chrome.tabs.query).toHaveBeenCalled()
            expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, {message: 'analyzeStoryDescription'})
            expect(sendEvent).toHaveBeenCalledWith('analyze_story_details')
        })
    })

    describe('processOpenAIResponse', () => {
        it('should handle OpenAIResponseCompleted message', async () => {
            await AiFunctions.processOpenAIResponse({type: 'OpenAIResponseCompleted'})

            const analyzeText = document.getElementById('analyzeText')
            expect(analyzeText.textContent).toBe('Analyze Story')
            expect(document.getElementById('loadingSpan')).toBeNull()
        })

        it('should handle OpenAIResponseFailed message and hide errorState after 6 seconds', async () => {
            jest.useFakeTimers()
            await AiFunctions.processOpenAIResponse({type: 'OpenAIResponseFailed'})

            const errorState = document.getElementById('errorState')
            expect(utilsModule.sleep).toHaveBeenCalledWith(6000)
            jest.advanceTimersByTime(6000)

            expect(errorState.style.display).toBe('none')
            expect(sendEvent).toHaveBeenCalledWith('analyze_story_details_failed')
        })
    })
})
