import {getSyncedSetting} from './utils.js'
import {getNotes} from './notes'
import * as Sentry from '@sentry/browser'
import {sendEvent} from '../analytics/event'
import {fetchCompletion} from './fetch_completion'
import {OpenAIError} from '../errors'
import {onInstallAndUpdate} from './onInstallAndUpdate'


const manifestData = chrome.runtime.getManifest();
Sentry.init({dsn: 'https://966b241d3d57856bd13a0945fa9fa162@o49777.ingest.sentry.io/4506624214368256',
             release: manifestData.version,
             environment: process.env.NODE_ENV});

export const PROMPT = "You help make sure that tickets are ready for development. What sorts of technical questions should I ask before beginning development. The basic fundamentals of our application are already setup and not open questions (database, etc). Do not ask questions about the following: 1. Unit Testing 2. Basic Architecture Setup (Database, etc) 3. Deadlines 4) Concurrency\n" +
    "\n" +
    "Examples of good questions: - Are there performance or scalability requirements or considerations for the feature?' - What user roles and permissions need to be accounted for within this feature? - What new monitoring or alerting should be put in place? - Should we consider implementing a feature flag' - Have all instances where the deprecated model is used been identified\n" +
    "Examples of bad questions: - What are the technical and business requirements for the feature?(too broad) - How will the system access and query the Customers database?(implementation already known) - What are the specific user story requirements and how do they align with the broader application requirements? (too broad)\n" +
    "\n" +
    "Give the top 5 questions in a concise manner, just state the questions without any intro. "


export async function getOpenAiToken() {
    try {
        const result = await chrome.storage.local.get("openAIToken");
        const value = result["openAIToken"];
        if (value !== undefined) {
            return value;
        }
        else {
            return null;
        }
    } catch (error) {
        console.error('Error getting OpenAI token:', error);
        throw error;
    }
}


async function getCompletionFromProxy(description){
    try {
        const url = process.env.PROXY_URL
        const instanceId = await chrome.instanceID.getID()
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                description: description,
                instanceId: instanceId
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error(`Proxy response was not ok. Status: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        return data.content
    } catch (error) {
        throw OpenAIError('Error getting completion from proxy:', error);
    }
}


export async function callOpenAI(description, tabId){
    const token = await getOpenAiToken()
    let messagesData
    let message

    if (!token) {
        messagesData = await getCompletionFromProxy(description)
        message = messagesData
    }
    else {
        try {
            await fetchCompletion(description, tabId)
        } catch (e) {
            throw OpenAIError('Error getting completion from OpenAI:', e);
        }
    }
    chrome.tabs.sendMessage(tabId, {'message': 'setOpenAiResponse', 'data': message})
    return message
}


if (typeof self !== 'undefined' && self instanceof ServiceWorkerGlobalScope) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'callOpenAI') {
            callOpenAI(request.data.prompt, sender.tab.id).then(response => {
                if (response) {
                    sendResponse({data: response});
                }
            });
            return true; // Keep the message channel open for the async response
        }
        if (request.message === 'getOpenAiToken') {
            getOpenAiToken().then(token => {
                sendResponse({token: token});
            });
            return true;
        }
        if (request.action === 'getSavedNotes') {
            getNotes().then(value => {
                sendResponse({data: value});
            });
            return true;
        }
    });
}

chrome.runtime.onInstalled.addListener(onInstallAndUpdate)

chrome.tabs.onUpdated.addListener(async function
        (tabId, changeInfo, tab) {
        if (changeInfo.url && changeInfo.url.includes('app.shortcut.com')) {
            chrome.tabs.sendMessage(tabId, {
                message: 'update',
                url: changeInfo.url
            });
            const enableStalledWorkWarnings = await getSyncedSetting('enableStalledWorkWarnings', true)
            if (enableStalledWorkWarnings) {
                chrome.tabs.sendMessage(tabId, {
                    message: 'initDevelopmentTime',
                    url: changeInfo.url
                });
                sendEvent('init_development_time')
            }
            const enableTodoistOptions = await getSyncedSetting('enableTodoistOptions', false)
            if (enableTodoistOptions) {
                chrome.tabs.sendMessage(tabId, {
                    message: 'initTodos',
                    url: changeInfo.url
                });
                sendEvent('init_todos')
            }
            chrome.tabs.sendMessage(tabId, {
                message: 'initNotes',
                data: await getNotes(),
                url: changeInfo.url
            });
        }
    }
);
