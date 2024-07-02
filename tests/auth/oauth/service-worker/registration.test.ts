import registerUser from '@sx/auth/oauth/service-worker/registration'


jest.mock('@sx/auth/oauth/service-worker/listener')
global.chrome = {
  ...chrome,
  storage: {
    ...chrome.storage,
    local: {
      ...chrome.storage.local,
      get: jest.fn(),
    },
  },
}

describe('registerUser', () => {
  const mockChromeStorageSyncGet = chrome.storage.local.get as jest.Mock
  const originalFetch = global.fetch

  beforeEach(() => {
    mockChromeStorageSyncGet.mockReset()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('registers a user successfully', async () => {
    const token = 'testToken'
    const shortcutApiToken = 'shortcutApiTokenValue'

    mockChromeStorageSyncGet.mockResolvedValue({ shortcutApiToken })

    const fetchMock = global.fetch as jest.Mock
    fetchMock.mockResolvedValue({ json: jest.fn().mockReturnValue({ key: '123' }), ok: true })

    process.env.PROXY_URL = 'https://proxy.url'

    await registerUser(token)

    expect(mockChromeStorageSyncGet).toHaveBeenCalledWith('shortcutApiToken')
    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.PROXY_URL}/users/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'shortcutApiTokenValue'
        },
        body: JSON.stringify({
          shortcutApiToken: shortcutApiToken,
          googleAuthToken: token
        }),
      }
    )
  })

  it('handles errors in fetching user info', async () => {
    const token = 'testToken'
    const shortcutApiToken = 'shortcutApiTokenValue'
    const fetchMock = global.fetch as jest.Mock
    mockChromeStorageSyncGet.mockResolvedValue({ shortcutApiToken })
    fetchMock.mockResolvedValueOnce({ ok: false, status: 400 })
    await expect(registerUser(token)).rejects.toThrow('HTTP error. Status: 400')

    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.PROXY_URL}/users/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'shortcutApiTokenValue',
        },
        body: JSON.stringify({
          shortcutApiToken: shortcutApiToken,
          googleAuthToken: token,
        }),
      }
    )
    expect(mockChromeStorageSyncGet).toHaveBeenCalled()
    expect(global.fetch).toHaveBeenCalled()
  })

  it('handles errors in fetching shortcut API token', async () => {
    const token = 'testToken'

    mockChromeStorageSyncGet.mockRejectedValue(new Error('Failed to fetch shortcut API token'))

    await expect(registerUser(token)).rejects.toThrow('Failed to fetch shortcut API token')

    expect(mockChromeStorageSyncGet).toHaveBeenCalledWith('shortcutApiToken')
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
