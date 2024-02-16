import * as Sentry from '@sentry/browser'

/**
 * Retrieves the company slug from the given tab id and change information.
 * @param {number} tabId - The id of the tab to retrieve the company slug from.
 * @param {object} changeInfo - The change information object containing the URL.
 * @return {Promise<string>} The company slug extracted from the URL.
 * Ex. 'https://app.shortcut.com/companySlug/story/123' => 'companySlug'
 */
export async function getCompanySlugFromTab(tabId, changeInfo){
    return changeInfo.url.split('/')[3]
}

export async function setCompanySlug(companySlug){
    await chrome.storage.sync.set({companySlug: companySlug})
}

export async function getCompanySlug(){
    const result = await chrome.storage.sync.get('companySlug')
    const value = result['companySlug']
    if (value !== undefined) {
        return value
    }
    else {
        return null
    }
}

export async function refreshCompanySlug(tabId, changeInfo){
    let companySlug = await getCompanySlug()
    if (companySlug) {
        companySlug = await getCompanySlugFromTab(tabId, changeInfo)
        setCompanySlug(companySlug).catch(e => {
            console.error('Error setting company slug:', e)
            Sentry.captureException(e)
        })
    }
}