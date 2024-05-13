import {AiPromptType} from '@sx/analyze/types/ai-prompt-type'


export enum AiProcessMessageType {
  'completed' = 2,
  'failed' = 1,
  'updated' = 0,
}

export interface AiProcessMessage {
  type: AiProcessMessageType
  message?: string
  data: { content: string, type: AiPromptType }
}
