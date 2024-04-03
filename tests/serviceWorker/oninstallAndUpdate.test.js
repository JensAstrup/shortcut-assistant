import {captureException} from '@sentry/browser'
import {InstallAndUpdate, onInstallAndUpdate} from '../../src/js/serviceWorker/onInstallAndUpdate'
import * as Sentry from '@sentry/browser'


describe('onInstall function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    chrome.action.setBadgeText.mockClear()
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
    chrome.windows.create.mockClear()
  })
  test('it sets badge text and color', async () => {
    await InstallAndUpdate.onUpdate()

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({text: ' '})
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({color: '#a30000'})
  })
})

describe('onInstallAndUpdate function', () => {
  let onInstall, onUpdate

  beforeEach(() => {
    jest.clearAllMocks()
    onInstall = jest.spyOn(InstallAndUpdate, 'onInstall').mockResolvedValue(null)
    onUpdate = jest.spyOn(InstallAndUpdate, 'onUpdate').mockResolvedValue(null)
  })
  test('it calls onInstall when reason is install', () => {
    onInstallAndUpdate({reason: 'install'})

    expect(onInstall).toHaveBeenCalledTimes(1)
  })
  test('it calls onUpdate when reason is update and there is an updated changelog', () => {
    process.env.CHANGELOG_VERSION = '1.0.0'
    process.env.VERSION = '1.0.0'
    onInstallAndUpdate({reason: 'update'})
    expect(onUpdate).toHaveBeenCalledTimes(1)
  })
  test('it does not call onUpdate when reason is update and there is no updated changelog', () => {
    process.env.CHANGELOG_VERSION = '1.0.1'
    process.env.VERSION = '1.0.0'
    onInstallAndUpdate({reason: 'update'})
    expect(onUpdate).not.toHaveBeenCalled()
  })
  test('it logs to console and Sentry when an error occurs', async () => {
    process.env.CHANGELOG_VERSION = '1.0.0'
    process.env.VERSION = '1.0.0'
    const captureException = jest.spyOn(Sentry, 'captureException')
    const error = new Error('Test error')
    onUpdate.mockRejectedValue(error)
    console.error = jest.fn()
    await onInstallAndUpdate({reason: 'update'})

    expect(console.error).toHaveBeenCalledWith('Error updating:', error)
    expect(captureException).toHaveBeenCalledWith(error)
  })
})
