import Tab = chrome.tabs.Tab;

export async function getActiveTab(): Promise<Tab | undefined> {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    console.log('tabs', tabs);
    if (chrome.runtime.lastError) {
        console.log('chrome.runtime.lastError', chrome.runtime.lastError);
        throw chrome.runtime.lastError;
    } else if (tabs.length === 0) {
        console.log('No active tab found');
        throw new Error('No active tab found');
    } else {
        console.log('tabs[0]', tabs[0]);
        return tabs[0];
    }
}
