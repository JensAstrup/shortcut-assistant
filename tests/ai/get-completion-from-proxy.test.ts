import { TextDecoder } from 'util'

import getCompletionFromProxy, {readStream} from '@sx/ai/get-completion-from-proxy'
import {getOrCreateClientId} from '@sx/analytics/client-id'
import {AiProcessMessageType} from '@sx/analyze/types/AiProcessMessage'
import {OpenAIError} from '@sx/utils/errors'


jest.mock('@sx/analytics/client-id')
global.fetch = jest.fn()
Object.assign(global, {TextDecoder: TextDecoder})

describe('readStream', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should read the stream and send messages', async () => {
    const reader = {
      read: jest.fn()
        .mockResolvedValueOnce({done: false, value: new Uint8Array([1, 2, 3])})
        .mockResolvedValueOnce({done: true})
    } as unknown as jest.Mocked<ReadableStreamDefaultReader<Uint8Array>>
    const tabId = 1
    const type = 'type'

    readStream(reader, type, tabId)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, {
      type: AiProcessMessageType.updated,
      data: {content: '', type}
    })
  })

  it('should send a completed message when done', async () => {
    const reader = {
      read: jest.fn().mockResolvedValue({done: true})
    } as unknown as jest.Mocked<ReadableStreamDefaultReader<Uint8Array>>
    const tabId = 123
    const type = 'type'
    readStream(reader, type, tabId)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, {
      type: AiProcessMessageType.completed,
      message: 'Stream completed',
      data: {content: '', type}
    })
  })

  it('should send a failed message when an error occurs', async () => {
    const reader = {
      read: jest.fn().mockRejectedValue(new Error('error'))
    } as unknown as jest.Mocked<ReadableStreamDefaultReader<Uint8Array>>
    const tabId = 123
    const type = 'type'
    readStream(reader, type, tabId)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, {
      type: AiProcessMessageType.failed,
      message: 'error'
    })
  })
})

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

  it('throws an error if fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('fetch error'))
    await expect(getCompletionFromProxy('description', 'type', 3))
      .rejects.toThrow(new OpenAIError('Error getting completion from proxy: Error: fetch error'))
  })

  it('throws an error if response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    })
    await expect(getCompletionFromProxy('description', 'type', 3))
      .rejects.toThrow(new OpenAIError('Proxy response was not ok. Status: 500 Internal Server Error'))
  })

  it('throws an error if no data is returned', async () => {
    const response = {ok: true, body: {getReader: () => null}} as unknown as Response
    (global.fetch as jest.Mock).mockResolvedValue(response)
    await expect(getCompletionFromProxy('description', 'type', 3))
      .rejects.toThrow(new OpenAIError('No data returned from proxy'))
  })

})
