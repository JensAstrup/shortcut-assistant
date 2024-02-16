import * as Sentry from '@sentry/browser'

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