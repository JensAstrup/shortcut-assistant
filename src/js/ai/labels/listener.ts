import LabelsServiceWorker from '@sx/ai/labels/service-worker'
import { AiProcessMessage } from '@sx/analyze/types/AiProcessMessage'
import IpcRequest from '@sx/types/ipc-request'


chrome.runtime.onMessage.addListener((request: AiProcessMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: unknown) => void) => {
  if (request.action === 'addLabels') {
    LabelsServiceWorker.requestLabels().then(sendResponse)
    return true
  }
})
