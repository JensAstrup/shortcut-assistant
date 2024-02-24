import {GA_ENDPOINT, GOOGLE_ANALYTICS_API_SECRET, MEASUREMENT_ID} from './config'
import {getOrCreateClientId} from './clientId';
import {getOrCreateSessionId} from './sessionId';

const DEFAULT_ENGAGEMENT_TIME_IN_MSEC = 100
const version = chrome.runtime.getManifest().version

export async function sendEvent(eventName,  params = {}){
    fetch(
      `${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${GOOGLE_ANALYTICS_API_SECRET}`,
        {
            method: "POST",
            body: JSON.stringify({
                client_id: await getOrCreateClientId(),
                events: [
                    {
                        name: eventName,
                        params: {
                            client_id: await getOrCreateSessionId(),
                            session_id: await getOrCreateSessionId(),
                            engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
                            version,
                            ...params,
                        },
                    },
                ],
            }),
        }
    );
}
