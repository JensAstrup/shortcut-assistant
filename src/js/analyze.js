async function analyzeStoryDetails() {
    let analyzeButton = document.getElementById('analyzeButton');

    analyzeButton.textContent = 'Analyzing...';

    chrome.tabs.query({active: true, currentWindow: true}, function (activeTabs) {
        chrome.tabs.sendMessage(activeTabs[0].id, {message: 'analyzeStoryDescription'});
    });
}
document.getElementById('analyzeButton').addEventListener('click', analyzeStoryDetails);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.message === "OpenAIResponseCompleted") {
        let analyzeButton = document.getElementById('analyzeButton');
        analyzeButton.textContent = 'Analyze Story';
    }
});
