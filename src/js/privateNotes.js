function getActiveTabUrl() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else if (tabs.length === 0) {
                reject(new Error("No active tab found"));
            } else {
                let activeTab = tabs[0];
                let activeTabUrl = activeTab.url;
                resolve(activeTabUrl);
            }
        });
    });
}

async function getStoryId() {
    const url = await getActiveTabUrl()
    const regex = /\/story\/(\d+)/;
    const match = url.match(regex);

    if (match) {
        const storyId = match[1];
        console.log("Story ID:", storyId);
        return storyId
    } else {
        console.log("Story ID not found");
    }
}
async function setNotes() {
    const storyNotesInput = document.getElementById('storyNotes')
    const storyId = await getStoryId()
    const key = "notes_" + storyId
    console.log(key)
    chrome.storage.sync.get(key).then((result) => {
        const value = result[key]
        if (value !== undefined) {
            storyNotesInput.value = result[key]
        }
    });
}

document.getElementById('saveButton').addEventListener('click', async function() {
    const storyNotesInput = document.getElementById('storyNotes')
    const storyId = await getStoryId()
    const data = {['notes_' + storyId]: storyNotesInput.value}
    chrome.storage.sync.set(data).then(() => {
        console.log({['notes_' + storyId]: storyNotesInput.value});
    }).catch(response => {
        console.log(response)
    });
});


document.addEventListener('DOMContentLoaded', function() {
    console.log('set notes')
    try{
        const storyNotes = document.getElementById('storyNotes');
    }
    catch{
        return
    }
    setNotes()
    function autoExpandTextarea() {
        // Reset the height to ensure the scrollHeight includes only the content
        this.style.height = 'auto';
        // Set the height to the scrollHeight to expand the textarea
        this.style.height = (this.scrollHeight) + 'px';
    }

    storyNotes.addEventListener('input', autoExpandTextarea);
    console.log(storyNotes)
});


tailwind.config = {
    darkMode: 'class',
}