export async function getCompanySlugFromTab(tabId, changeInfo) {
    const url = changeInfo.url
    return url.split('/')[3]
}

export async function setCompanySlug(companySlug) {
    await chrome.storage.sync.set({companySlug: companySlug})
}

export async function getCompanySlug() {
    const result = await chrome.storage.sync.get("companySlug");
    const value = result["companySlug"];
    if (value !== undefined) {
        return value;
    }
    else {
        return null;
    }
}
