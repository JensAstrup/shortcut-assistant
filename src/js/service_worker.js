const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


async function getOpenAiToken() {
    try {
        const result = await chrome.storage.sync.get("openAIToken");
        const value = result["openAIToken"];
        if (value !== undefined) {
            return value;
        } else {
            throw new Error('OpenAI token not found');
        }
    } catch (error) {
        console.error('Error getting OpenAI token:', error);
        throw error; // Or handle the error as appropriate
    }
}
const apiHeaders = {"Content-Type": "application/json", "OpenAI-Beta": "assistants=v1"};

async function fetchAPI(url, method = 'GET', body=null) {
    const openAIToken = await getOpenAiToken();
    const headers = {...apiHeaders, "Authorization": `Bearer ${openAIToken}`};
    const options = {method, headers};
    if (method !== 'GET' && body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    return response.json();
}

async function fetchOpenAIAssistant() {
    return fetchAPI("https://api.openai.com/v1/assistants/asst_BkzaS0v8wHUBDiYkDImKvDn0");
}

async function fetchOpenAIThreads() {
    return fetchAPI("https://api.openai.com/v1/threads", 'POST', {});
}

async function postMessageToThread(threadId, messageContent) {
    return fetchAPI(`https://api.openai.com/v1/threads/${threadId}/messages`, 'POST', {
        "role": "user",
        "content": messageContent.prompt
    });
}

async function createRunInThread(threadId) {
    return fetchAPI(`https://api.openai.com/v1/threads/${threadId}/runs`, 'POST', {
        "assistant_id": 'asst_BkzaS0v8wHUBDiYkDImKvDn0',
    });
}

async function fetchRunDetails(threadId, runId) {
    return fetchAPI(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`);
}

async function fetchMessagesFromThread(threadId) {
    return fetchAPI(`https://api.openai.com/v1/threads/${threadId}/messages`);
}


async function callOpenAI(description, tabId) {
    await fetchOpenAIAssistant();

    let threadIdData = await fetchOpenAIThreads();
    let threadId = threadIdData.id;

    await postMessageToThread(threadId, description);

    let runIdData = await createRunInThread(threadId);
    let runId = runIdData.id;

    let runData = await fetchRunDetails(threadId, runId);
    let runStatus = runData.status;

    let count = 0;
    while ((runStatus === 'in_progress' || runStatus === 'queued') && count < 6) {
        await sleep(5000);
        runData = await fetchRunDetails(threadId, runId);
        runStatus = runData.status;
        count += 1;
    }

    if (runStatus === 'in_progress') {
        await sleep(7000);
        await fetchRunDetails(threadId, runId);
    }

    let messagesData = await fetchMessagesFromThread(threadId);
    let message = messagesData.data[0].content[0].text.value;

    chrome.tabs.sendMessage(tabId, {"message": "setOpenAiResponse", "data": message});
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'callOpenAI') {
        console.log('Analyzing')
        await callOpenAI(request.data.prompt, sender.tab.id).then(response => {
            chrome.runtime.sendMessage({ message: "OpenAIResponseCompleted" });
            sendResponse({data: response});
        });
        return true; // Indicates an asynchronous response
    }
});
chrome.tabs.onUpdated.addListener(function
        (tabId, changeInfo, tab) {
        if (changeInfo.url && changeInfo.url.includes('app.shortcut.com')) {
            chrome.tabs.sendMessage(tabId, {
                message: 'update',
                url: changeInfo.url
            });
            chrome.tabs.sendMessage(tabId, {
                message: 'checkDevelopmentTime',
                url: changeInfo.url
            });
        }
    }
);