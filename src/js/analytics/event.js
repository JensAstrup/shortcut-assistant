import {GA_ENDPOINT, GOOGLE_ANALYTICS_API_SECRET, MEASUREMENT_ID} from './config';
import {getOrCreateClientId} from './clientId';
import {getOrCreateSessionId} from './sessionId';


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
                            session_id: await getOrCreateSessionId(),
                            ...params,
                        },
                    },
                ],
            }),
        }
    );
}