import {
  GA_ENDPOINT,
  GOOGLE_ANALYTICS_API_SECRET,
  MEASUREMENT_ID,
  DEFAULT_ENGAGEMENT_TIME_IN_MSEC
} from './config'
import {getOrCreateClientId} from './clientId'
import {getOrCreateSessionId} from './sessionId'


const version: string = chrome.runtime.getManifest().version


export async function sendEvent(eventName: string, params = {}): Promise<void> {
  fetch(
    `${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${GOOGLE_ANALYTICS_API_SECRET}`,
    {
      method: 'POST',
      body: JSON.stringify({
        client_id: await getOrCreateClientId(),
        events: [
          {
            name: eventName,
            params: {
              client_id: await getOrCreateClientId(),
              session_id: await getOrCreateSessionId(),
              engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
              environment: process.env.NODE_ENV,
              version,
              ...params
            }
          }
        ]
      })
    }
  )
}
