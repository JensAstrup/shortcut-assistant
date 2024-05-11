import getCompletionFromProxy from '@sx/ai/get-completion-from-proxy'
import {getOrCreateClientId} from '@sx/analytics/client-id'
import {OpenAIError} from '@sx/utils/errors'


jest.mock('@sx/analytics/client-id')
global.fetch = jest.fn()

describe('getCompletionFromProxy', () => {
  beforeEach(() => {
    process.env.PROXY_URL = 'https://proxy.example.com';
    (getOrCreateClientId as jest.Mock).mockResolvedValue('test-instance-id')
  })

  it('throws an error if PROXY_URL is not set', async () => {
    delete process.env.PROXY_URL
    await expect(getCompletionFromProxy('description', 'type', 3))
      .rejects.toThrow(new OpenAIError('Error getting completion from proxy: OpenAIError: PROXY_URL is not set'))
  })
})
