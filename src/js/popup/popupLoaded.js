import * as Sentry from '@sentry/browser'

import {
    DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
    GA_ENDPOINT,
    GOOGLE_ANALYTICS_API_SECRET,
    MEASUREMENT_ID
} from '../analytics/config'
import {getOrCreateClientId} from '../analytics/clientId'
import {getOrCreateSessionId} from '../analytics/sessionId'
import {getSyncedSetting} from '../serviceWorker/utils'
import {setSectionDisplay} from './popup'


export async function handleNewVersionBade(){
    const infoTab = document.getElementById('infoTab')
    const tabBadge = infoTab.querySelector('.badge')
    const badgeBackgroundText = await chrome.action.getBadgeText({})
    if (badgeBackgroundText === '') {
        tabBadge.style.display = 'none'
    }
}


export async function popupLoaded(){
    const actionsTab = document.getElementById('actionsTab')
    const settingsTab = document.getElementById('settingsTab')
    const infoTab = document.getElementById('infoTab')
    const actionsSection = document.getElementById('actionsSection')
    const settingsSection = document.getElementById('settingsSection')
    const infoSection = document.getElementById('infoSection')

    const enableStalledWorkWarnings = await getSyncedSetting('enableStalledWorkWarnings', true)
    const enableTodoistOptions = await getSyncedSetting('enableTodoistOptions', false)

    const stalledWorkCheckbox = document.getElementById('stalledWorkToggle')
    const todoistCheckbox = document.getElementById('todoistOptions')

    stalledWorkCheckbox.checked = enableStalledWorkWarnings
    todoistCheckbox.checked = enableTodoistOptions

    setSectionDisplay(actionsTab, actionsSection, [settingsTab, infoTab], [settingsSection, infoSection])
    setSectionDisplay(settingsTab, settingsSection, [actionsTab, infoTab], [actionsSection, infoSection])
    setSectionDisplay(infoTab, infoSection, [actionsTab, settingsTab], [actionsSection, settingsSection])

    handleNewVersionBade().catch((e) => {
        console.error(e)
        Sentry.captureException(e)
    })
}

export async function trackPopupViewEvent(){
    fetch(`${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${GOOGLE_ANALYTICS_API_SECRET}`,
        {
            method: 'POST',
            body: JSON.stringify({
                client_id: await getOrCreateClientId(),
                events: [
                    {
                        name: 'popup_view',
                        params: {
                            session_id: await getOrCreateSessionId(),
                            engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
                            page_title: document.title,
                            page_location: document.location.href
                        }
                    }
                ]
            })
        }
    )
}