function getStoryNotesInput() {
    return document.getElementById('storyNotes');
}

function getNotesKey(storyId) {
    return "notes_" + storyId;
}

function getActiveTabUrl() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else if (tabs.length === 0) {
                reject(new Error("No active tab found"));
            } else {
                let activeTabUrl = tabs[0].url;
                resolve(activeTabUrl);
            }
        });
    });
}

async function getStoryId() {
    const url = await getActiveTabUrl();
    const match = url.match(/\/story\/(\d+)/);

    return match ? match[1] : null;
}

async function fetchAndSetNotes() {
    const key = getNotesKey(await getStoryId());
    const storyNotesInput = getStoryNotesInput();

    chrome.storage.sync.get(key).then((result) => {
        const value = result[key];
        if (value !== undefined) {
            storyNotesInput.value = value;
        }
    });
}

document.getElementById('saveButton').addEventListener('click', async function () {
    const data = {[getNotesKey(await getStoryId())]: getStoryNotesInput().value};
    chrome.storage.sync.set(data);
});

document.addEventListener('DOMContentLoaded', function () {
    try {
        const storyNotesInput = getStoryNotesInput();

        function autoExpandTextarea() {
            // Reset the height to ensure the scrollHeight includes only the content
            this.style.height = 'auto';
            // Set the height to the scrollHeight to expand the textarea
            this.style.height = (this.scrollHeight) + 'px';
        }

        storyNotesInput.addEventListener('input', autoExpandTextarea);

    } catch {
        return;
    }

    fetchAndSetNotes();
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.message === "checkNotes") {
        fetchAndSetNotes();
    }
});


tailwind.config = {
    darkMode: 'class',
};
