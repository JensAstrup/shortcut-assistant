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


async function fetchOpenAIAssistant() {
    const openAIToken = await getOpenAiToken();
    const url = "https://api.openai.com/v1/assistants/asst_BkzaS0v8wHUBDiYkDImKvDn0";
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIToken}`,
        "OpenAI-Beta": "assistants=v1"
    };
    const response = await fetch(url, {headers: headers});
    return response.json();
}

async function fetchOpenAIThreads() {
    const openAIToken = await getOpenAiToken();
    const url = "https://api.openai.com/v1/threads";
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIToken}`,
        "OpenAI-Beta": "assistants=v1"
    };
    const response = await fetch(url, {method: 'POST', headers: headers, body: ''});
    return response.json();
}

async function postMessageToThread(threadId, messageContent) {
    const openAIToken = await getOpenAiToken();
    const url = `https://api.openai.com/v1/threads/${threadId}/messages`;
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIToken}`,
        "OpenAI-Beta": "assistants=v1"
    };
    const body = JSON.stringify({
        "role": "user",
        "content": messageContent.prompt
    });
    const response = await fetch(url, {method: 'POST', headers: headers, body: body});
    return response.json();
}

async function createRunInThread(threadId) {
    const openAIToken = await getOpenAiToken();
    const url = `https://api.openai.com/v1/threads/${threadId}/runs`;
    const headers = {
        "Authorization": `Bearer ${openAIToken}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v1"
    };
    const body = JSON.stringify({
        "assistant_id": 'asst_BkzaS0v8wHUBDiYkDImKvDn0',
    });
    const response = await fetch(url, {method: 'POST', headers: headers, body: body});
    return response.json();
}

async function fetchRunDetails(threadId, runId) {
    const openAIToken = await getOpenAiToken();
    const url = `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`;
    const headers = {
        "Authorization": `Bearer ${openAIToken}`,
        "OpenAI-Beta": "assistants=v1"
    };
    const response = await fetch(url, {headers: headers});
    return response.json();
}

async function fetchMessagesFromThread(threadId) {
    const openAIToken = await getOpenAiToken();
    const url = `https://api.openai.com/v1/threads/${threadId}/messages`;
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIToken}`,
        "OpenAI-Beta": "assistants=v1"
    };
    const response = await fetch(url, {headers: headers});
    return response.json();
}


async function callOpenAI(description, tabId) {
    await fetchOpenAIAssistant();
    const threadIdData = await fetchOpenAIThreads();
    const threadId = threadIdData.id
    await postMessageToThread(threadId, description);
    const runIdData = await createRunInThread(threadId);
    const runId = runIdData.id
    let runData = await fetchRunDetails(threadId, runId);
    let runStatus = runData.status
    let count = 0
    while ((runStatus === 'in_progress' || runStatus === 'queued') && count < 6) {
        await sleep(2500)
        runData = await fetchRunDetails(threadId, runId);
        count += 1;
    }
    if (runStatus === 'in_progress') {
        await sleep(5000);
        await fetchRunDetails(threadId, runId);
    }
    const messagesData = await fetchMessagesFromThread(threadId);
    const message = messagesData.data[0].content[0].text.value
    chrome.tabs.sendMessage(tabId, {"message": "setOpenAiResponse", "data": message});
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'callOpenAI') {
        await callOpenAI(request.data.prompt, sender.tab.id).then(response => {
            console.log(response)
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