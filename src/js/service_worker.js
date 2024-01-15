const PROMPT = "You help make sure that tickets are ready for development. What sorts of technical questions should I ask before beginning development. The basic fundamentals of our application are already setup and not open questions (database, etc). Do not ask questions about the following: 1. Unit Testing 2. Basic Architecture Setup (Database, etc) 3. Deadlines 4) Concurrency\n" +
    "\n" +
    "Examples of good questions: - Are there performance or scalability requirements or considerations for the feature?' - What user roles and permissions need to be accounted for within this feature? - What new monitoring or alerting should be put in place? - Should we consider implementing a feature flag' - Have all instances where the deprecated model is used been identified\n" +
    "Examples of bad questions: - What are the technical and business requirements for the feature?(too broad) - How will the system access and query the Customers database?(implementation already known) - What are the specific user story requirements and how do they align with the broader application requirements? (too broad)\n" +
    "\n" +
    "Give the top 5 questions in a concise manner, just state the questions without any intro. "

function getActiveTabUrl() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            }
            else if (tabs.length === 0) {
                reject(new Error("No active tab found"));
            }
            else {
                let activeTabUrl = tabs[0].url;
                resolve(activeTabUrl);
            }
        });
    });
}

function getNotesKey(storyId) {
    return "notes_" + storyId;
}

async function getStoryId() {
    const url = await getActiveTabUrl();
    const match = url.match(/\/story\/(\d+)/);

    return match ? match[1] : null;
}

async function getNotes() {
    return new Promise(async (resolve, reject) => {
        const key = getNotesKey(await getStoryId());
        console.log('fetching and setting')
        chrome.storage.sync.get(key).then((result) => {
            const value = result[key];
            console.log('Fetched from storage')
            if (value !== undefined) {
                resolve(value)
            }
        });
    })
}


async function getOpenAiToken() {
    try {
        const result = await chrome.storage.local.get("openAIToken");
        const value = result["openAIToken"];
        if (value !== undefined) {
            return value;
        }
        else {
            throw new Error('OpenAI token not found');
        }
    } catch (error) {
        console.error('Error getting OpenAI token:', error);
        throw error;
    }
}


async function getSyncedSetting(setting, defaultValue) {
    try {
        const result = await chrome.storage.sync.get(setting);
        const {[setting]: value = defaultValue} = result;
        return value;
    } catch (error) {
        console.error('Error getting setting value:', error);
        throw error;
    }
}

async function fetchCompletion(description) {
    const openAIToken = await getOpenAiToken();
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + openAIToken);

    const requestBody = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {
                "role": "system",
                "content": PROMPT
            },
            {
                "role": "user",
                "content": description
            }
        ]
    };

    const options = {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', options)
    return response.json();
}

async function callOpenAI(description, tabId) {
    let messagesData = await fetchCompletion(description);
    let message = messagesData.choices[0].message.content;
    chrome.tabs.sendMessage(tabId, {"message": "setOpenAiResponse", "data": message});
    return message
}

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
    if (request.message === 'getStoryNotes') {
        getNotes().then(value => {
            sendResponse({notes: value});
        });
        return true;
    }
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
            }
            const enableTodoistOptions = await getSyncedSetting('enableTodoistOptions', true)
            if (enableTodoistOptions) {
                chrome.tabs.sendMessage(tabId, {
                    message: 'initTodos',
                    url: changeInfo.url
                });
            }
            chrome.tabs.sendMessage(tabId, {
                message: 'initNotes',
                data: await getNotes(),
                url: changeInfo.url
            });
        }
    }
);