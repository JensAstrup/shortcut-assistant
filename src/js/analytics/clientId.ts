export async function getOrCreateClientId(): Promise<string> {
    const result = await chrome.storage.sync.get('clientId');
    console.log(result);
    let clientId = result.clientId;
    if (!clientId) {
        clientId = crypto.randomUUID();
        await chrome.storage.sync.set({clientId});
    }
    return clientId;
}
