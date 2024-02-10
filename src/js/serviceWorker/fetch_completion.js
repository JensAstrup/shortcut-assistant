import OpenAI from 'openai'
import {getOpenAiToken, PROMPT} from './service_worker'
import {OpenAIError} from '../errors'

export async function fetchCompletion(description){
    const openAIToken = await getOpenAiToken()
    const openai = new OpenAI({apiKey: openAIToken})

    let messages = [{role: 'system', content: PROMPT}, {role: 'user', content: description}]
    const completion = await openai.chat.completions.create({
        messages: messages,
        model: 'gpt-3.5-turbo'
    })

    if (!completion.choices || !completion.choices[0]) {
        throw new OpenAIError('No completion choices returned')
    }

    try {
        return completion.choices[0]
    } catch (e) {
        throw new OpenAIError('Error parsing completion choices')
    }
}