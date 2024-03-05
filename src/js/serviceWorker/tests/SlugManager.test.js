import {SlugManager} from '../slugManager'
import * as Sentry from '@sentry/browser'


global.chrome = {
  storage: {
    sync: {
      get: jest.fn((key, callback) => {
        const data = {'companySlug': 'companySlug1'}
        if (typeof callback === 'function') {
          callback(data)
        }
        return data
      }),
      set: jest.fn((data, callback) => {
        if (typeof callback === 'function') {
          callback()
        }
      })
    }
  }
}

describe('SlugManager', () => {
  describe('getCompanySlugFromTab', () => {
    it('should get the company slug from tab info', async () => {
      const testData = {
        url: 'https://testing.com/companySlug/page'
      }

      const result = await SlugManager.getCompanySlugFromTab(1, testData)

      expect(result).toEqual('companySlug')
    })
  })

  describe('setCompanySlug', () => {
    it('should set the company slug in chrome storage', async () => {
      const companySlug = 'companySlug'

      await SlugManager.setCompanySlug(companySlug)

      expect(global.chrome.storage.sync.set).toBeCalledWith({companySlug})
    })
  })

  describe('getCompanySlug', () => {
    it('should get the company slug from chrome storage', async () => {
      global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        const data = {'companySlug': 'companySlug'}
        if (typeof callback === 'function') {
          callback({companySlug: 'companySlug'})
        }
        return data
      })

      const result = await SlugManager.getCompanySlug()

      expect(global.chrome.storage.sync.get).toBeCalledWith('companySlug')
      expect(result).toEqual('companySlug')
    })

    it('should return null if the company slug is not found', async () => {
      global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        const data = {'companySlug': undefined}
        if (typeof callback === 'function') {
          callback({companySlug: undefined})
        }
        return data
      })

      const result = await SlugManager.getCompanySlug()

      expect(global.chrome.storage.sync.get).toBeCalledWith('companySlug')
      expect(result).toEqual(null)
    })
  })

  describe('refreshCompanySlug', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should refresh the company slug', async () => {
      jest.spyOn(SlugManager, 'getCompanySlugFromTab').mockResolvedValue('newCompanySlug')
      const setSpy = jest.spyOn(SlugManager, 'setCompanySlug')

      await SlugManager.refreshCompanySlug(1, {url: 'https://testing.com/newCompanySlug/page'})

      expect(setSpy).toHaveBeenCalledWith('newCompanySlug')
    })

    it('should log an error and capture an exception if an error occurs', async () => {
      jest.spyOn(SlugManager, 'getCompanySlugFromTab')
      const setSpy = jest.spyOn(SlugManager, 'setCompanySlug').mockRejectedValue('error')
      const sentrySpy = jest.spyOn(Sentry, 'captureException')
      console.error = jest.fn()

      await SlugManager.refreshCompanySlug(1, {url: 'https://testing.com/newCompanySlug/page'})

      expect(setSpy).toHaveBeenCalledWith('newCompanySlug')
      expect(console.error).toHaveBeenCalledWith('Error setting company slug:', 'error')
      expect(sentrySpy).toHaveBeenCalledWith('error')
    })

    it('should not set the company slug if the company slug is not found', async () => {
      SlugManager.getCompanySlugFromTab.mockResolvedValue(undefined)
      const setSpy = jest.spyOn(SlugManager, 'setCompanySlug')

      await SlugManager.refreshCompanySlug(1, {url: 'https://testing.com/newCompanySlug/page'})

      expect(setSpy).not.toHaveBeenCalled()
    })
  })
})
