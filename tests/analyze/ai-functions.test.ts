import {AiFunctions} from '@sx/analyze/ai-functions'
import sleep from '@sx/utils/sleep'
import {Story} from '@sx/utils/story'


jest.mock('@sentry/browser', () => ({
  captureException: jest.fn(),
}))
jest.mock('@sx/analytics/event', () => ({
  sendEvent: jest.fn().mockResolvedValue({})
}))
jest.mock('@sx/utils/story')
jest.mock('@sx/utils/sleep', () => jest.fn().mockResolvedValue(undefined))


describe('AiFunctions', () => {
  describe('createButton', () => {
    it('should create a button with the correct attributes', () => {
      const button = AiFunctions.createButton()
      expect(button.className).toBe('action edit-description add-task micro flat-white')
      expect(button.dataset.tooltip).toBe('Analyse Story Details')
      expect(button.tabIndex).toBe(2)
      expect(button.getAttribute('data-analyze')).toBe('true')
    })
  })

  describe('addAnalyzeButton', () => {
    it('adds the analyze button if it does not exist', async () => {
      document.body.innerHTML = '<div id="buttonContainer"></div>'
      const container = document.getElementById('buttonContainer')
      Story.getEditDescriptionButtonContainer = jest.fn().mockResolvedValue(container)

      await AiFunctions.addAnalyzeButton()

      expect(container?.querySelector('button')).toBeTruthy()
      expect(container?.querySelector('button')?.textContent).toBe('Analyze Story')
    })

    it('should add an event listener to the new button', async () => {
      const mockButton = {
        addEventListener: jest.fn(),
        textContent: ''
      } as unknown as HTMLButtonElement
      jest.spyOn(AiFunctions, 'createButton').mockReturnValue(mockButton)
      jest.spyOn(AiFunctions, 'buttonExists').mockReturnValue(null)
      jest.spyOn(AiFunctions, 'triggerAnalysis').mockResolvedValue()

      jest.spyOn(AiFunctions, 'addButtonIfNotExists').mockResolvedValue()

      await AiFunctions.addAnalyzeButton()

      expect(AiFunctions.createButton).toHaveBeenCalled()
      expect(mockButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))
      expect(mockButton.textContent).toBe('Analyze Story')
      expect(AiFunctions.addButtonIfNotExists).toHaveBeenCalledWith(mockButton)
    })

    it('should call triggerAnalysis on button click', async () => {
      const mockButton = {
        addEventListener: jest.fn(),
        textContent: ''
      } as unknown as HTMLButtonElement
      jest.spyOn(AiFunctions, 'createButton').mockReturnValue(mockButton)
      jest.spyOn(AiFunctions, 'buttonExists').mockReturnValue(null)
      jest.spyOn(AiFunctions, 'triggerAnalysis').mockResolvedValue() // Mock triggerAnalysis
      jest.spyOn(AiFunctions, 'addButtonIfNotExists').mockResolvedValue()

      await AiFunctions.addAnalyzeButton()

      // @ts-expect-error - We know the event listener is added
      const clickEventListener = mockButton.addEventListener.mock.calls.find(call => call[0] === 'click')[1]
      await clickEventListener()

      expect(AiFunctions.triggerAnalysis).toHaveBeenCalled() // Assert triggerAnalysis was called
    })

    it('does not add button if it already exists', async () => {
      AiFunctions.buttonExists = jest.fn().mockReturnValue(true)
      const spyAddButtonIfNotExists = jest.spyOn(AiFunctions, 'addButtonIfNotExists')

      await AiFunctions.addAnalyzeButton()

      expect(spyAddButtonIfNotExists).not.toHaveBeenCalled()
    })

  })

  describe('triggerAnalysis', () => {
    it('should call analyzeStoryDescription', async () => {
      jest.spyOn(AiFunctions, 'analyzeStoryDescription').mockResolvedValue()
      await AiFunctions.triggerAnalysis()
      expect(AiFunctions.analyzeStoryDescription).toHaveBeenCalled()
    })
  })

  describe('analyzeStoryDescription', () => {
    it('should call OpenAI with story description if URL contains "story"', async () => {
      // Mock the getter for description
      const mockDescription = 'This is a sample story description.'
      Object.defineProperty(Story, 'description', {
        get: jest.fn(() => mockDescription),
        configurable: true
      })

      // Mock textContent and includes method
      AiFunctions.analyzeButton = {textContent: ''} as unknown as HTMLButtonElement
      jest.spyOn(String.prototype, 'includes').mockReturnValue(true)

      // Mock chrome.runtime.sendMessage
      const sendMessageMock = jest.fn()
      chrome.runtime.sendMessage = sendMessageMock
      sendMessageMock.mockResolvedValue(null)

      // Call the method under test
      await AiFunctions.analyzeStoryDescription('http://example.com/story')

      // Assertions
      expect(Story.description).toBe(mockDescription)
      expect(sendMessageMock).toHaveBeenCalledWith({
        action: 'callOpenAI',
        data: {prompt: mockDescription}
      })
      expect(AiFunctions.analyzeButton.textContent).toBe('Analyzing...')
    })
  })

  it('should not analyze the description if the URL does not include "story"', async () => {
    jest.spyOn(Story, 'description', 'get').mockReturnValue('This is a description')
    const sendMessage = jest.fn()
    chrome.runtime.sendMessage = sendMessage
    await AiFunctions.analyzeStoryDescription('https://www.example.com/')
    expect(sendMessage).not.toHaveBeenCalled()
  })

  describe('complete', () => {
    it('should set the button text to "Analyze Story"', async () => {
      AiFunctions.analyzeButton = {textContent: ''} as unknown as HTMLButtonElement
      await AiFunctions.complete()
      expect(AiFunctions.analyzeButton.textContent).toBe('Analyze Story')
    })
  })


  describe('processOpenAIResponse', () => {
    beforeEach(() => {
      document.body.innerHTML = '<button id="analyzeButton">Analyze Story</button><div id="loadingSpan"></div>'
      const button = document.getElementById('analyzeButton') as HTMLButtonElement
      if (button) {
        AiFunctions.analyzeButton = button
      }
    })

    it('handles completed responses by updating UI', async () => {
      await AiFunctions.processOpenAIResponse({type: 'OpenAIResponseCompleted'})
      expect(AiFunctions.analyzeButton.textContent).toBe('Analyze Story')
      expect(document.getElementById('loadingSpan')).toBeNull()
    })

    it('handles failed responses and removes error after timeout', async () => {
      jest.useFakeTimers()
      document.body.innerHTML += '<div id="errorState"></div>'
      await AiFunctions.processOpenAIResponse({type: 'OpenAIResponseFailed'})
      const SIX_SECONDS = 6000
      expect(sleep).toHaveBeenCalledWith(SIX_SECONDS)
      jest.runAllTimers() // Fast-forward time
      expect(document.getElementById('errorState')?.style.display).toBe('none')
    })
  })
})
