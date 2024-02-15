import OpenAI from 'openai'
import {getOpenAiToken, PROMPT} from './service_worker'


export async function fetchCompletion(description, tabId){
    const openAIToken = await getOpenAiToken()
    const openai = new OpenAI({apiKey: openAIToken})

    let messages = [{role: 'system', content: PROMPT}, {role: 'user', content: description}]
    const stream = await openai.chat.completions.create({
        messages: messages,
        model: 'gpt-3.5-turbo',
        stream: true
    })
    for await (const chunk of stream) {
        const data = chunk.choices[0]?.delta?.content || ""
        chrome.tabs.sendMessage(tabId, {"message": "updateOpenAiResponse", "data": data});
    }
    chrome.runtime.sendMessage({message: 'OpenAIResponseCompleted'})
}