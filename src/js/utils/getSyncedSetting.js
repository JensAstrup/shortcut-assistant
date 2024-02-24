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
