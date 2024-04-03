import {getOrCreateClientId} from '../../src/js/analytics/clientId'
import getCompletionFromProxy from '../../src/js/ai/getCompletionFromProxy'
import fetch from 'node-fetch'


if (!global.fetch) {
  global.fetch = fetch
}
// Mocking the dependencies
jest.mock('../../src/js/analytics/clientId', () => ({
  getOrCreateClientId: jest.fn()
}))
jest.mock('node-fetch', () => jest.fn())

describe('getCompletionFromProxy', () => {
  const mockSuccessResponse = {content: 'test response'}
  const mockUrl = 'https://test.url'
  let originalEnv

  beforeAll(() => {
    originalEnv = process.env
    process.env.PROXY_URL = mockUrl
  })

  afterAll(() => {
    process.env = originalEnv
  })

  beforeEach(() => {
    jest.resetAllMocks()
    fetch.mockImplementation(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockSuccessResponse)
    }))
    getOrCreateClientId.mockResolvedValue('test-client-id')
  })

  it('should successfully fetch data from proxy', async () => {
    const description = 'test description'
    const result = await getCompletionFromProxy(description)

    expect(fetch).toHaveBeenCalledWith(mockUrl, {
      method: 'POST',
      body: JSON.stringify({
        description,
        instanceId: 'test-client-id'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    expect(result).toEqual(mockSuccessResponse.content)
  })

  it('should throw an error for non-ok response from proxy', async () => {
    fetch.mockImplementationOnce(() => Promise.resolve({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    }))

    await expect(getCompletionFromProxy('test description')).rejects.toThrow('Proxy response was not ok. Status: 404 Not Found')
  })

})
