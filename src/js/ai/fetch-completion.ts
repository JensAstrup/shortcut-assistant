import OpenAI from 'openai'
import {Chat} from 'openai/resources'

import getOpenAiToken from './get-openai-token'
import PROMPT from './prompt'

import ChatCompletionMessageParam = Chat.ChatCompletionMessageParam


export async function fetchCompletion(description: string, tabId: number) {
  const openAIToken = await getOpenAiToken()
  const openai = new OpenAI({apiKey: openAIToken})

  const messages: ChatCompletionMessageParam[] = [{role: 'system', content: PROMPT},
    {role: 'user', content: description}]
  const stream = await openai.chat.completions.create({
    messages: messages,
    model: 'gpt-4-turbo-preview',
    stream: true
  })
  for await (const chunk of stream) {
    const data = chunk.choices[0]?.delta?.content || ''
    chrome.tabs.sendMessage(tabId, {type: 'updateOpenAiResponse', 'data': data})
  }
  chrome.runtime.sendMessage({type: 'OpenAIResponseCompleted'})
}
