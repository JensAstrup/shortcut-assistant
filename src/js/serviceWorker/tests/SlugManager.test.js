import { SlugManager } from '../slugManager'

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
        url: 'https://testing.com/companySlug/page',
      };

      const result = await SlugManager.getCompanySlugFromTab(1, testData);

      expect(result).toEqual('companySlug');
    });
  });

  describe('setCompanySlug', () => {
    it('should set the company slug in chrome storage', async () => {
      const companySlug = 'companySlug';

      await SlugManager.setCompanySlug(companySlug);

      expect(global.chrome.storage.sync.set).toBeCalledWith({ companySlug });
    });
  });

  describe('getCompanySlug', () => {
    it('should get the company slug from chrome storage', async () => {
      global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        const data = {'companySlug': 'companySlug'}
        if (typeof callback === 'function') {
            callback({ companySlug: 'companySlug' });
        }
        return data
      });

      const result = await SlugManager.getCompanySlug();

      expect(global.chrome.storage.sync.get).toBeCalledWith('companySlug');
      expect(result).toEqual('companySlug');
    });
  });

  describe('refreshCompanySlug', () => {
    it('should refresh the company slug if it exists in chrome storage', async () => {
      jest.spyOn(SlugManager, 'getCompanySlug').mockResolvedValue('oldCompanySlug');
      jest.spyOn(SlugManager, 'getCompanySlugFromTab').mockResolvedValue('newCompanySlug');
      const setSpy = jest.spyOn(SlugManager, 'setCompanySlug');

      await SlugManager.refreshCompanySlug(1, { url: 'https://testing.com/newCompanySlug/page' });

      expect(setSpy).toHaveBeenCalledWith('newCompanySlug');
    });
  });
});