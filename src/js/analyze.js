const ANALYZE_BUTTON_ID = 'analyzeButton';
const ANALYZE_MESSAGE = {message: 'analyzeStoryDescription'};

async function analyzeStoryDetails() {
    chrome.tabs.query({active: true, currentWindow: true}, function (activeTabs) {
        chrome.tabs.sendMessage(activeTabs[0].id, ANALYZE_MESSAGE);
    });
}

document.getElementById(ANALYZE_BUTTON_ID).addEventListener('click', analyzeStoryDetails);