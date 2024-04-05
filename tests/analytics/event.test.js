/**
 * @jest-environment node
 */

import {getOrCreateClientId} from '../../src/js/analytics/client-id'
import {sendEvent} from '../../src/js/analytics/event'
import {getOrCreateSessionId} from '../../src/js/analytics/session-id'
import {
  GA_ENDPOINT,
  GOOGLE_ANALYTICS_API_SECRET,
  MEASUREMENT_ID,
  DEFAULT_ENGAGEMENT_TIME_IN_MSEC
} from '../../src/js/analytics/config'


jest.mock('../../src/js/analytics/client-id', () => ({
  getOrCreateClientId: jest.fn()
}))
jest.mock('../../src/js/analytics/session-id', () => ({
  getOrCreateSessionId: jest.fn()
}))

describe('sendEvent', () => {
  const fakeClientId = 'fake-client-id'
  const fakeSessionId = 'fake-session-id'
  const version = '1.0.0'
  global.fetch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    getOrCreateClientId.mockResolvedValue(fakeClientId)
    getOrCreateSessionId.mockResolvedValue(fakeSessionId)
  })

  it('calls the correct GA endpoint with the right parameters', async () => {
    const eventName = 'test_event'
    const additionalParams = {key: 'value'}

    await sendEvent(eventName, additionalParams)

    expect(fetch).toHaveBeenCalledWith(
      `${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${GOOGLE_ANALYTICS_API_SECRET}`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          client_id: fakeClientId,
          events: [
            {
              name: eventName,
              params: {
                client_id: fakeClientId,
                session_id: fakeSessionId,
                engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
                debug_mode: false,
                version,
                ...additionalParams
              }
            }
          ]
        })
      })
    )
  })

  it('ensures getOrCreateClientId and getOrCreateSessionId are called', async () => {
    await sendEvent('test_event')

    expect(getOrCreateClientId).toHaveBeenCalledTimes(2) // Since it's called twice within the function
    expect(getOrCreateSessionId).toHaveBeenCalledTimes(1)
  })
})
