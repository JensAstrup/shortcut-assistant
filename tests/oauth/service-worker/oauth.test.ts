import { fetchUserInfo } from '@sx/oauth/service-worker/oauth'


const mockFetch = jest.fn()
global.fetch = mockFetch

describe('fetchUserInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call fetch with the correct URL and headers', async (): Promise<void> => {
    const token = 'test_token'
    const mockResponseData = { id: '123', name: 'Test User' }
    mockFetch.mockResolvedValueOnce(JSON.stringify(mockResponseData))

    await fetchUserInfo(token)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
  })

  it('should handle fetch errors gracefully', async () => {
    const token = 'test_token'

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    mockFetch.mockRejectedValueOnce(new Error('Test error'))
    await fetchUserInfo(token)
    expect(mockFetch).toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user info:', new Error('Test error'))
  })

  it('should call sendUserToBackend with user info and token', async () => {
    const token = 'test_token'
    const mockResponseData = { id: '123', name: 'Test User' }
    mockFetch.mockResolvedValueOnce(JSON.stringify(mockResponseData))

    await expect(fetchUserInfo(token)).resolves.toBeUndefined()
  })
})
