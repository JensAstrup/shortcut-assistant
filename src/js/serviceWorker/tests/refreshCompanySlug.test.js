import * as companySlugModule from '../companySlug'

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


describe('Testing refreshCompanySlug function', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.restoreAllMocks()

        jest.spyOn(companySlugModule, 'getCompanySlug').mockResolvedValue('test')
        jest.spyOn(companySlugModule, 'getCompanySlugFromTab').mockResolvedValue(undefined)
        jest.spyOn(companySlugModule, 'setCompanySlug').mockResolvedValue(undefined)
    })

    it('should get company slug if it exists', async () => {
        const tabId = 'tab1'
        const changeInfo = {}

        await companySlugModule.refreshCompanySlug(tabId, changeInfo)

        expect(companySlugModule.setCompanySlug).not.toHaveBeenCalled()
    })

    it('should get and set company slug from tab if company slug does not exist', async () => {
        const tabId = 'tab1'
        const changeInfo = {}

        companySlugModule.getCompanySlug.mockResolvedValueOnce(null)

        await companySlugModule.refreshCompanySlug(tabId, changeInfo)

        expect(companySlugModule.setCompanySlug).not.toHaveBeenCalled()
    })
})
