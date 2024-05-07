import * as Sentry from '@sentry/browser'

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

    it('does not add button if it already exists', async () => {
      AiFunctions.buttonExists = jest.fn().mockReturnValue(true)
      const spyAddButtonIfNotExists = jest.spyOn(AiFunctions, 'addButtonIfNotExists')

      await AiFunctions.addAnalyzeButton()

      expect(spyAddButtonIfNotExists).not.toHaveBeenCalled()
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
