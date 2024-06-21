import { fetchUserInfo } from '@sx/oauth/service-worker/oauth'


const mockFetch = jest.fn()
global.fetch = mockFetch

describe('fetchUserInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call fetch with the correct URL and headers', async (): Promise<void> => {
    const token = 'test_token'
    const mockResponseData = { id: '123', name: 'Test User', ok: true, json: jest.fn() }
    mockFetch.mockResolvedValueOnce(mockResponseData)

    await fetchUserInfo(token)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
  })

  it('should handle error if response is not ok', async () => {
    const token = 'test_token'
    const mockResponseData = { ok: false, status: 400 }
    mockFetch.mockResolvedValueOnce(mockResponseData)

    await expect(fetchUserInfo(token)).rejects.toThrow('HTTP error. Status: 400')
  })

  it('should handle fetch errors gracefully', async () => {
    const token = 'test_token'

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    mockFetch.mockRejectedValueOnce(new Error('Test error'))
    await expect(fetchUserInfo(token)).rejects.toThrow('Test error')
    expect(mockFetch).toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user info:', new Error('Test error'))
  })
})
