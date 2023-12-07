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
document.getElementById('saveKeyButton').addEventListener('click', async function() {
    var openAIToken = document.getElementById('openAIToken').value;
    chrome.storage.sync.set({'openAIToken': openAIToken })
});
document.addEventListener('DOMContentLoaded', function() {
    const tabActions = document.getElementById('tabActions');
    const tabSettings = document.getElementById('tabSettings');
    const actionsSection = document.getElementById('actionsSection');
    const settingsSection = document.getElementById('settingsSection');

    tabActions.addEventListener('click', function(e) {
        e.preventDefault();
        actionsSection.classList.remove('hidden');
        settingsSection.classList.add('hidden');
        tabActions.classList.add('-mb-px');
        tabSettings.classList.remove('-mb-px');
    });

    tabSettings.addEventListener('click', function(e) {
        e.preventDefault();
        settingsSection.classList.remove('hidden');
        actionsSection.classList.add('hidden');
        tabSettings.classList.add('-mb-px');
        tabActions.classList.remove('-mb-px');
    });
});

tailwind.config = {
    darkMode: 'class',
}