

document.getElementById('analyzeButton').addEventListener('click', async function() {
    console.log('analyzeStoryDescription')
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {message: 'analyzeStoryDescription'});
    });
});