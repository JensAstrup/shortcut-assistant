import * as Sentry from '@sentry/browser'

import { sendEvent } from '@sx/analytics/event'
import { handleCommands } from '@sx/service-worker/handlers'
import { onInstallAndUpdate } from '@sx/service-worker/on-install-and-update'
import { SlugManager } from '@sx/service-worker/slug-manager'
import checkHost from '@sx/utils/check-host'
import { getSyncedSetting } from '@sx/utils/get-synced-setting'
import { Story } from '@sx/utils/story'



jest.mock('@sentry/browser')
jest.mock('@sx/analytics/event')
jest.mock('@sx/service-worker/handlers')
jest.mock('@sx/utils/check-host')
const mockedCheckHost = checkHost as jest.MockedFunction<typeof checkHost>
jest.mock('@sx/utils/get-synced-setting')
const mockedGetSyncedSetting = getSyncedSetting as jest.MockedFunction<typeof getSyncedSetting>
jest.mock('@sx/utils/story', () => ({
  Story: {
    notes: jest.fn()
  }
}))
const mockedStory = Story as jest.Mocked<typeof Story>

describe('Chrome Extension behavior', () => {
  describe('Sentry initialization', () => {
    it('should initialize Sentry with correct parameters', () => {
      expect(Sentry.init).toHaveBeenCalledWith({
        dsn: expect.any(String),
        release: expect.any(String),
        environment: expect.any(String)
      })
    })
  })

  describe('Command handling', () => {
    it('should add a listener for chrome.commands.onCommand', () => {
      expect(chrome.commands.onCommand.addListener).toHaveBeenCalledWith(handleCommands)
    })
  })

  describe('Installation and update handling', () => {
    it('should add a listener for chrome.runtime.onInstalled', () => {
      expect(chrome.runtime.onInstalled.addListener).toHaveBeenCalledWith(onInstallAndUpdate)
    })
  })

  describe('Tab update handling', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should handle tab URL updates with a recognized host', async () => {
      const tabId = 123
      const changeInfo = { url: 'http://validurl.com/path' }
      mockedCheckHost.mockReturnValue(true)
      mockedGetSyncedSetting.mockResolvedValue(true)
      mockedStory.notes.mockResolvedValue('notes')

      // @ts-expect-error Migrating from JS
      await chrome.tabs.onUpdated.callListeners(tabId, changeInfo)

      expect(SlugManager.refreshCompanySlug).toHaveBeenCalledWith(tabId, changeInfo)
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, expect.objectContaining({
        message: 'update',
        url: changeInfo.url
      }))
      expect(sendEvent).toHaveBeenCalledTimes(2)
    })

    it('should not handle tab updates for unrecognized hosts', async () => {
      const tabId = 123
      const changeInfo = { url: 'http://invalidurl.com/path' }
      mockedCheckHost.mockReturnValue(false)

      // @ts-expect-error Migrating from JS
      await chrome.tabs.onUpdated.callListeners(tabId, changeInfo)

      expect(SlugManager.refreshCompanySlug).not.toHaveBeenCalled()
      expect(chrome.tabs.sendMessage).not.toHaveBeenCalled()
    })
  })
})
