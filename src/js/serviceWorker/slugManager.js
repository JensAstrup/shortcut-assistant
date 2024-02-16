import * as Sentry from '@sentry/browser'


export class SlugManager{
    static async getCompanySlugFromTab(tabId, changeInfo){
        return changeInfo.url.split('/')[3]
    }

    static async setCompanySlug(companySlug){
        await chrome.storage.sync.set({companySlug: companySlug})
    }

    static async getCompanySlug(){
        const result = await chrome.storage.sync.get('companySlug')
        const value = result['companySlug']
        if (value !== undefined) {
            return value
        }
        else {
            return null
        }
    }

    static async refreshCompanySlug(tabId, changeInfo){
        let companySlug = await this.getCompanySlug()
        if (companySlug) {
            companySlug = await this.getCompanySlugFromTab(tabId, changeInfo)
            this.setCompanySlug(companySlug).catch(e => {
                console.error('Error setting company slug:', e)
                Sentry.captureException(e)
            })
        }
    }
}