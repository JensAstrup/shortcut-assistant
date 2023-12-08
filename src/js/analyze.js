async function analyzeStoryDetails() {
    // Get the button element
    let analyzeButton = document.getElementById('analyzeButton');

    // Update the button text
    analyzeButton.textContent = 'Analyzing...';

    chrome.tabs.query({active: true, currentWindow: true}, function (activeTabs) {
        chrome.tabs.sendMessage(activeTabs[0].id, {message: 'analyzeStoryDescription'});

        // You may also want to reset the button text after analyzing is complete.
        // Note: This assumes `chrome.tabs.sendMessage` is asynchronous.
        //analyzeButton.textContent = 'Analyze';
    });
}
document.getElementById('analyzeButton').addEventListener('click', analyzeStoryDetails);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('here: ')
    console.log(message)
    if (message.message === "OpenAIResponseCompleted") {
        // Handle the message here in the popup script
        let analyzeButton = document.getElementById('analyzeButton');
        analyzeButton.textContent = 'Analyze Story';
    }
});
