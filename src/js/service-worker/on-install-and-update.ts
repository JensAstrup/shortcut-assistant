import InstalledDetails = chrome.runtime.InstalledDetails


class InstallAndUpdate {
  // eslint-disable-next-line @typescript-eslint/require-await
  static async onInstall(): Promise<void> {
    chrome.windows.create({
      url: '../html/installed.html',
      type: 'popup',
      width: 310,
      height: 500
    })
    chrome.storage.sync.set({ enableTodoistOptions: false }).catch((e) => {
      console.error('Error setting enableTodoistOptions:', e)
    })
  }

  static async onUpdate(): Promise<void> {
    await chrome.action.setBadgeText({ text: ' ' })
    await chrome.action.setBadgeBackgroundColor({ color: '#a30000' })
  }
}


async function onInstallAndUpdate(details: InstalledDetails): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (details.reason === 'install') {
    await InstallAndUpdate.onInstall()
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  else if (details.reason === 'update') {
    // Only display the update page if the changelog has been updated for the current version
    if (process.env.CHANGELOG_VERSION === process.env.VERSION) {
      InstallAndUpdate.onUpdate().catch((e) => {
        console.error('Error updating:', e)
      })
    }
  }
}

export { InstallAndUpdate, onInstallAndUpdate }
