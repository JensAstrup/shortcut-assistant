export async function getOrCreateClientId() {
    const result = await chrome.storage.sync.get('clientId');
    let clientId = result.clientId;
    if (!clientId) {
        clientId = self.crypto.randomUUID();
        await chrome.storage.sync.set({clientId});
    }
    return clientId;
}