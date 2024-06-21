import { fetchUserInfo } from '@sx/oauth/service-worker/oauth'
import registerUser from '@sx/oauth/service-worker/registration'


jest.mock('@sx/oauth/service-worker/oauth')
global.chrome = {
  ...chrome,
  storage: {
    ...chrome.storage,
    sync: {
      ...chrome.storage.sync,
      get: jest.fn(),
    },
  },
}

describe('registerUser', () => {
  const mockFetchUserInfo = fetchUserInfo as jest.Mock
  const mockChromeStorageSyncGet = chrome.storage.sync.get as jest.Mock
  const originalFetch = global.fetch

  beforeEach(() => {
    mockFetchUserInfo.mockReset()
    mockChromeStorageSyncGet.mockReset()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('registers a user successfully', async () => {
    const token = 'testToken'
    const userInfo = { email: 'test@example.com', name: 'Test User', id: 'googleId' }
    const shortcutApiToken = 'shortcutApiTokenValue'

    mockFetchUserInfo.mockResolvedValue(userInfo)
    mockChromeStorageSyncGet.mockResolvedValue({ shortcutApiToken })

    const fetchMock = global.fetch as jest.Mock
    fetchMock.mockResolvedValue({})

    process.env.PROXY_URL = 'https://proxy.url'

    await registerUser(token)

    expect(mockFetchUserInfo).toHaveBeenCalledWith(token)
    expect(mockChromeStorageSyncGet).toHaveBeenCalledWith('shortcutApiToken')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://proxy.url/users/register',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userInfo.email,
          name: userInfo.name,
          shortcutApiToken: shortcutApiToken,
          googleId: userInfo.id,
        }),
      }
    )
  })

  it('handles errors in fetching user info', async () => {
    const token = 'testToken'

    mockFetchUserInfo.mockRejectedValue(new Error('Failed to fetch user info'))

    await expect(registerUser(token)).rejects.toThrow('Failed to fetch user info')

    expect(mockFetchUserInfo).toHaveBeenCalledWith(token)
    expect(mockChromeStorageSyncGet).not.toHaveBeenCalled()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('handles errors in fetching shortcut API token', async () => {
    const token = 'testToken'
    const userInfo = { email: 'test@example.com', name: 'Test User', id: 'googleId' }

    mockFetchUserInfo.mockResolvedValue(userInfo)
    mockChromeStorageSyncGet.mockRejectedValue(new Error('Failed to fetch shortcut API token'))

    await expect(registerUser(token)).rejects.toThrow('Failed to fetch shortcut API token')

    expect(mockFetchUserInfo).toHaveBeenCalledWith(token)
    expect(mockChromeStorageSyncGet).toHaveBeenCalledWith('shortcutApiToken')
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
