/**
 * @jest-environment jsdom
 */

import {getStoryId} from './getStoryId'
import * as urlModule from './getActiveTabUrl'

jest.mock('./getActiveTabUrl', () => ({
  getActiveTabUrl: jest.fn()
}))

describe('getStoryId', () => {
  it('returns the correct story ID from a valid URL', async () => {
    urlModule.getActiveTabUrl.mockResolvedValue('https://app.shortcut.com/story/12345')
    await expect(getStoryId()).resolves.toBe('12345')
  })

  it('returns null if the URL does not contain a story ID', async () => {
    urlModule.getActiveTabUrl.mockResolvedValue('https://app.shortcut.com/profile')
    await expect(getStoryId()).resolves.toBeNull()
  })

  it('handles URLs with additional path segments correctly', async () => {
    urlModule.getActiveTabUrl.mockResolvedValue('https://app.shortcut.com/story/12345/details')
    await expect(getStoryId()).resolves.toBe('12345')
  })

  it('returns null if getActiveTabUrl rejects', async () => {
    urlModule.getActiveTabUrl.mockRejectedValue(new Error('Error fetching URL'))
    await expect(getStoryId()).rejects.toThrow('Error fetching URL')
  })
})
