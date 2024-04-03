import * as Sentry from '@sentry/browser'

import TabChangeInfo = chrome.tabs.TabChangeInfo


export class SlugManager {
  static async getCompanySlugFromTab(tabId: number, changeInfo: TabChangeInfo): Promise<string | null> {
    const url = changeInfo.url
    if (!url) {
      return null
    }
    return url.split('/')[3]
  }

  static async setCompanySlug(companySlug: string): Promise<void>{
    await chrome.storage.sync.set({companySlug: companySlug})
  }

  static async getCompanySlug(): Promise<string | null>{
    const result: {[key: string]: string} = await chrome.storage.sync.get('companySlug')
    const value = result['companySlug']
    if (value !== undefined) {
      return value
    }
    else {
      return null
    }
  }

  static async refreshCompanySlug(tabId: number, changeInfo: TabChangeInfo): Promise<void> {
    const companySlug = await this.getCompanySlugFromTab(tabId, changeInfo)
    if (companySlug) {
      this.setCompanySlug(companySlug).catch(e => {
        console.error('Error setting company slug:', e)
        Sentry.captureException(e)
      })
    }
  }
}
