import callOpenAi from '@sx/ai/call-openai'
import getOpenAiToken from '@sx/ai/get-openai-token'
import {getActiveTab} from '@sx/utils/get-active-tab'
import {Story} from '@sx/utils/story'


async function handleOpenAICall(prompt: string, tabId: number): Promise<{ data: string } | {
  error: Error
}> {
  try {
    const response = await callOpenAi(prompt, tabId)
    return {data: response}
  } catch (e: unknown) {
    console.error('Error calling OpenAI:', e)
    chrome.runtime.sendMessage({message: 'OpenAIResponseFailed'})
    return {error: e as Error}
  }
}

async function handleGetOpenAiToken(): Promise<{ token: string }> {
  const token = await getOpenAiToken()
  return {token}
}

async function handleGetSavedNotes(): Promise<{ data: string | null }> {
  const value = await Story.notes()
  return {data: value}
}

export async function handleCommands(command: string) {
  const activeTab = await getActiveTab()
  if (!activeTab || !activeTab.id) {
    return
  }
  if (command === 'change-state') {
    await chrome.tabs.sendMessage(activeTab.id, {message: 'change-state'})
  } else if (command === 'change-iteration') {
    await chrome.tabs.sendMessage(activeTab.id, {message: 'change-iteration'})
  } else if (command === 'copy-git-branch') {
    await chrome.tabs.sendMessage(activeTab.id, {message: 'copy-git-branch'})
  }
}

export {handleGetSavedNotes}
export {handleGetOpenAiToken}
export {handleOpenAICall}
