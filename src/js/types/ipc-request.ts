import { AiPromptType } from '@sx/analyze/types/ai-prompt-type'


type IpcAction = 'callOpenAI' | 'getSavedNotes' | 'sendEvent' | 'saveUserToken'

type IpcRequestBase = {
  action: IpcAction
  message?: string
}

type IpcRequestSendEvent = {
  action: 'sendEvent'
  data: { eventName: string, params?: Record<string, string> }
} & IpcRequestBase

type IpcRequestCallOpenAI = {
  action: 'callOpenAI'
  data: { prompt: string, type: AiPromptType }
} & IpcRequestBase

type IpcRequestGetSavedNotes = {
  action: 'getSavedNotes'
} & IpcRequestBase

type IpcRequestSaveUserToken = {
  action: 'saveUserToken'
  data: { token: string }
} & IpcRequestBase

type IpcRequest = IpcRequestSendEvent | IpcRequestCallOpenAI | IpcRequestGetSavedNotes | IpcRequestSaveUserToken

export default IpcRequest
export { IpcAction, IpcRequestBase, IpcRequestCallOpenAI, IpcRequestGetSavedNotes, IpcRequestSaveUserToken, IpcRequestSendEvent }
