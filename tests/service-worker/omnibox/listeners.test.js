import * as Sentry from '@sentry/browser'

import {sendEvent} from '../../../src/js/analytics/event'
import {
  redirectFromOmnibox,
  setOmniboxSuggestion
} from '../../../src/js/service-worker/omnibox/omnibox'


jest.mock('@sentry/browser', () => ({
  captureException: jest.fn()
}))



jest.mock('../../../src/js/analytics/event', () => ({
  sendEvent: jest.fn(() => Promise.resolve())
}))


jest.mock('../../../src/js/service-worker/omnibox/omnibox', () => ({
  redirectFromOmnibox: jest.fn(),
  setOmniboxSuggestion: jest.fn(() => Promise.resolve())
}))

describe('Omnibox interactions', () => {
  let inputChangedCallback
  let inputEnteredCallback

  beforeAll(() => {
    global.chrome = {
      omnibox: {
        onInputChanged: {
          addListener: jest.fn((callback) => {
            inputChangedCallback = callback // Save the callback for later use
          })
        },
        onInputEntered: {
          addListener: jest.fn((callback) => {
            inputEnteredCallback = callback // Save the callback for later use
          })
        }
      }
    }
    require('../../../src/js/service-worker/omnibox/listeners') // Ensure the listeners are registered
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets omnibox suggestion on input changed', async () => {
    await inputChangedCallback('test query') // Directly call the callback
    expect(setOmniboxSuggestion).toHaveBeenCalledWith('test query')
  })

  it('redirects from omnibox and sends event on input entered', () => {
    inputEnteredCallback('test query', 'currentTab') // Directly call the callback
    expect(redirectFromOmnibox).toHaveBeenCalledWith('test query', 'currentTab')
    expect(sendEvent).toHaveBeenCalledWith('omnibox_entered')
  })

  it('captures exception with Sentry if sendEvent fails', async () => {
    console.error = jest.fn()
    sendEvent.mockImplementationOnce(() => Promise.reject(new Error('Test Error')))
    await inputEnteredCallback('test query', 'currentTab') // Directly call the callback
    expect(Sentry.captureException).toHaveBeenCalled()
    expect(console.error).toHaveBeenCalled()
  })
})
