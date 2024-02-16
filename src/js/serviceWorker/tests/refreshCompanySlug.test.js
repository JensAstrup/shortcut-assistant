import {refreshCompanySlug} from '../service_worker'
import {getCompanySlug, getCompanySlugFromTab, setCompanySlug} from '../companySlug'

jest.mock('../companySlug', () => ({
    getCompanySlug: jest.fn(),
    getCompanySlugFromTab: jest.fn(),
    setCompanySlug: jest.fn().mockImplementation(() => Promise.resolve())
}))


describe('Testing refreshCompanySlug function', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should get company slug if it exists', async () => {
        const tabId = 'tab1'
        const changeInfo = {}

        const mockCompanySlug = 'companySlug1'

        getCompanySlug.mockResolvedValue(mockCompanySlug)

        await refreshCompanySlug(tabId, changeInfo)

        expect(getCompanySlug).toHaveBeenCalledTimes(1)
        expect(setCompanySlug).not.toHaveBeenCalled()
    })

    it('should get and set company slug from tab if company slug does not exist', async () => {
        const tabId = 'tab1'
        const changeInfo = {}

        const mockCompanySlugFromTab = 'companySlugFromTab'

        getCompanySlug.mockResolvedValueOnce(null)
        getCompanySlugFromTab.mockResolvedValueOnce(mockCompanySlugFromTab)

        await refreshCompanySlug(tabId, changeInfo)

        expect(getCompanySlug).toHaveBeenCalledTimes(1)
        expect(getCompanySlugFromTab).toHaveBeenCalledTimes(1)
        expect(setCompanySlug).toHaveBeenCalledTimes(1)
        expect(setCompanySlug).toHaveBeenCalledWith(mockCompanySlugFromTab)
    })
})