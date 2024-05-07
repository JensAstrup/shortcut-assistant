import * as Sentry from '@sentry/browser'
import 'jest-chrome'

import {
  InstallAndUpdate,
  onInstallAndUpdate
} from '@sx/service-worker/on-install-and-update'

import OnInstalledReason = chrome.runtime.OnInstalledReason


describe('onInstall function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // @ts-expect-error Migrating from JS
    chrome.action.setBadgeText.mockClear()
    // @ts-expect-error Migrating from JS
    chrome.action.setBadgeBackgroundColor.mockClear()
  })

  test('it sets initial configuration and opens installed.html', () => {
    InstallAndUpdate.onInstall()

    expect(chrome.windows.create).toHaveBeenCalledTimes(1)
    expect(chrome.windows.create).toHaveBeenCalledWith({
      url: '../html/installed.html',
      type: 'popup',
      width: 310,
      height: 500
    })

    expect(chrome.storage.sync.set).toHaveBeenCalledWith({'enableTodoistOptions': false})
  })
  test('it logs to console and Sentry when an error occurs setting values', async () => {
    const error = new Error('Test error')
    // @ts-expect-error Migrating from JS
    chrome.storage.sync.set.mockRejectedValue(error)
    console.error = jest.fn()
    const captureException = jest.spyOn(Sentry, 'captureException')

    await InstallAndUpdate.onInstall()

    expect(console.error).toHaveBeenCalledWith('Error setting enableTodoistOptions:', error)
    expect(captureException).toHaveBeenCalledWith(error)
  })
})

describe('onUpdate function ', () => {
  beforeEach(() => {
    // @ts-expect-error Migrating from JS
    chrome.windows.create.mockClear()
  })
  test('it sets badge text and color', async () => {
    await InstallAndUpdate.onUpdate()

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({text: ' '})
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({color: '#a30000'})
  })
})

describe('onInstallAndUpdate function', () => {
  let onInstall: jest.SpyInstance, onUpdate: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    // @ts-expect-error Migrating from JS
    onInstall = jest.spyOn(InstallAndUpdate, 'onInstall').mockResolvedValue()
    onUpdate = jest.spyOn(InstallAndUpdate, 'onUpdate').mockResolvedValue()
  })
  test('it calls onInstall when reason is install', () => {
    onInstallAndUpdate({reason: 'install' as OnInstalledReason})

    expect(onInstall).toHaveBeenCalledTimes(1)
  })
  test('it calls onUpdate when reason is update and there is an updated changelog', () => {
    process.env.CHANGELOG_VERSION = '1.0.0'
    process.env.VERSION = '1.0.0'
    onInstallAndUpdate({reason: 'update' as OnInstalledReason})
    expect(onUpdate).toHaveBeenCalledTimes(1)
  })
  test('it does not call onUpdate when reason is update and there is no updated changelog', () => {
    process.env.CHANGELOG_VERSION = '1.0.1'
    process.env.VERSION = '1.0.0'
    onInstallAndUpdate({reason: 'update' as OnInstalledReason})
    expect(onUpdate).not.toHaveBeenCalled()
  })
  test('it logs to console and Sentry when an error occurs', async () => {
    process.env.CHANGELOG_VERSION = '1.0.0'
    process.env.VERSION = '1.0.0'
    const captureException = jest.spyOn(Sentry, 'captureException')
    const error = new Error('Test error')
    onUpdate.mockRejectedValue(error)
    console.error = jest.fn()
    await onInstallAndUpdate({reason: 'update' as OnInstalledReason})

    expect(console.error).toHaveBeenCalledWith('Error updating:', error)
    expect(captureException).toHaveBeenCalledWith(error)
  })
})
