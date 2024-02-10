import { getSyncedSetting } from "./utils.js";
import {getNotes} from './notes';

import OpenAI from "openai";
import * as Sentry from '@sentry/browser';
import {sendEvent} from "../analytics/event";


const manifestData = chrome.runtime.getManifest();
Sentry.init({dsn: 'https://966b241d3d57856bd13a0945fa9fa162@o49777.ingest.sentry.io/4506624214368256',
             release: manifestData.version,
             environment: process.env.NODE_ENV});

const PROMPT = "You help make sure that tickets are ready for development. What sorts of technical questions should I ask before beginning development. The basic fundamentals of our application are already setup and not open questions (database, etc). Do not ask questions about the following: 1. Unit Testing 2. Basic Architecture Setup (Database, etc) 3. Deadlines 4) Concurrency\n" +
    "\n" +
    "Examples of good questions: - Are there performance or scalability requirements or considerations for the feature?' - What user roles and permissions need to be accounted for within this feature? - What new monitoring or alerting should be put in place? - Should we consider implementing a feature flag' - Have all instances where the deprecated model is used been identified\n" +
    "Examples of bad questions: - What are the technical and business requirements for the feature?(too broad) - How will the system access and query the Customers database?(implementation already known) - What are the specific user story requirements and how do they align with the broader application requirements? (too broad)\n" +
    "\n" +
    "Give the top 5 questions in a concise manner, just state the questions without any intro. "


async function getOpenAiToken() {
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


function getCompletionFromProxy(description) {
    return new Promise(async (resolve, reject) => {
        const url = 'https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-7932f4c9-dd5e-44e6-a067-5cbf1cf629d4/OpenAI_proxy/proxy'
        fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                "description": description,
                'instanceId': await chrome.instanceID.getID()
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
            else {
                throw new OpenAIError(`Proxy response was not ok. Status: ${response.status} ${response.statusText}`);
            }
        }).then(data => {
            resolve(data.content);
        }).catch(error => {
            reject(error);
        });
    });
}


async function fetchCompletion(description){
    const openAIToken = await getOpenAiToken()
    const openai = new OpenAI({apiKey: openAIToken})

    let messages = [{role: 'system', content: PROMPT}, {role: 'user', content: description}]
    const completion = await openai.chat.completions.create({
        messages: messages,
        model: 'gpt-3.5-turbo'
    })

    if (!completion.choices || !completion.choices[0]) {
        throw new OpenAIError('No completion choices returned')
    }

    try {
        return completion.choices[0]
    } catch (e) {
        throw new OpenAIError(e.message)
    }
}


async function callOpenAI(description, tabId) {
    const token = await getOpenAiToken();
    let messagesData
    let message

    if (!token) {
        messagesData = await getCompletionFromProxy(description);
        message = messagesData;
    }
    else {
        const completion = await fetchCompletion(description);
        message = completion.message.content;
    }
    chrome.tabs.sendMessage(tabId, {"message": "setOpenAiResponse", "data": message});
    return message
}


if (typeof self !== 'undefined' && self instanceof ServiceWorkerGlobalScope) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'callOpenAI') {
            callOpenAI(request.data.prompt, sender.tab.id).then(response => {
                sendResponse({data: response});
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

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === "install") {
        chrome.windows.create({
            url: '../installed.html',
            type: 'popup',
            width: 310,
            height: 500
        });
    }
    chrome.storage.sync.set({'enableStalledWorkWarnings': true});
    chrome.storage.sync.set({'enableTodoistOptions': false});
});


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
