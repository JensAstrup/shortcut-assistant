import {getOrCreateSessionId} from './sessionId'


describe('getOrCreateSessionId', () => {
  const originalNow = Date.now
  beforeAll(() => {
    Date.now = jest.fn()
  })

  afterAll(() => {
    Date.now = originalNow
  })

  beforeEach(() => {
    jest.clearAllMocks()
    global.chrome.storage.session.get.mockClear()
    global.chrome.storage.session.set.mockClear()
  })

  it('creates a new session when none exists', async () => {
    Date.now.mockReturnValue(new Date('2020-01-01').getTime())
    global.chrome.storage.session.get.mockResolvedValue({})

    const sessionId = await getOrCreateSessionId()

    expect(sessionId).toBeDefined()
    expect(global.chrome.storage.session.set).toHaveBeenCalledWith({
      sessionData: {
        session_id: expect.any(String),
        timestamp: expect.any(String)
      }
    })
  })

  it('returns existing session if within expiration limit', async () => {
    const currentTime = new Date('2020-01-01T00:15:00').getTime() // 15 minutes later
    const timestamp = new Date('2020-01-01').getTime().toString()
    Date.now.mockReturnValue(currentTime)
    const sessionData = {
      session_id: 'existing-session-id',
      timestamp: new Date('2020-01-01').getTime().toString() // Session started at 2020-01-01 00:00:00
    }
    global.chrome.storage.session.get.mockResolvedValue({sessionData})

    const sessionId = await getOrCreateSessionId()

    expect(sessionId).toBe(currentTime.toString())
    expect(global.chrome.storage.session.set).toHaveBeenCalledWith({
      sessionData: {
        session_id: currentTime.toString(),
        timestamp: currentTime.toString()
      }
    })
  })

  it('creates a new session when existing one is past expiration', async () => {
    const currentTime = new Date('2020-01-01T00:31:00').getTime() // 31 minutes later
    Date.now.mockReturnValue(currentTime)
    const sessionData = {
      session_id: 'expired-session-id',
      timestamp: new Date('2020-01-01').getTime().toString()
    }
    global.chrome.storage.session.get.mockResolvedValue({sessionData})

    const sessionId = await getOrCreateSessionId()

    expect(sessionId).not.toBe('expired-session-id')
    expect(global.chrome.storage.session.set).toHaveBeenCalledWith({
      sessionData: {
        session_id: expect.any(String),
        timestamp: currentTime.toString()
      }
    })
  })
})
