export function getActiveTab(){
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            }
            else if (tabs.length === 0) {
                reject(new Error("No active tab found"));
            }
            else {
                resolve(tabs[0]);
            }
        });
    });
}

export function getActiveTabUrl(){
    return new Promise((resolve, reject) => {
            getActiveTab().then(tab => resolve(tab.url)).catch((error) => reject(error))
        }
    )
}

export async function getStoryId() {
    const url = await getActiveTabUrl();
    const match = url.match(/\/story\/(\d+)/);

    return match ? match[1] : null;
}


export async function getSyncedSetting(setting, defaultValue) {
    try {
        const result = await chrome.storage.sync.get(setting);
        const {[setting]: value = defaultValue} = result;
        return value;
    } catch (error) {
        console.error('Error getting setting value:', error);
        throw error;
    }
}


