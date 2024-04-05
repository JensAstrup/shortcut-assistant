import {getOrCreateClientId} from '../analytics/client-id'
import {OpenAIError} from '../utils/errors'


export default async function getCompletionFromProxy(description: string) {
  let response
  try {
    const url = process.env.PROXY_URL
    if (!url) {
      throw new OpenAIError('PROXY_URL is not set')
    }
    const instanceId = await getOrCreateClientId()
    response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        description: description,
        instanceId: instanceId
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (e) {
    throw new OpenAIError(`Error getting completion from proxy: ${e}`)
  }

  if (!response.ok) {
    throw new OpenAIError(`Proxy response was not ok. Status: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.content
}
