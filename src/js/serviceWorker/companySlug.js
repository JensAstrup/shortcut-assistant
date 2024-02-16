export async function getCompanySlugFromTab(tabId, changeInfo) {
    const url = changeInfo.url
    if(url.indexOf('/search/') !== -1) {
        return null
    }
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
