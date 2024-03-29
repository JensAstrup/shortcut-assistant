import {getOrCreateClientId} from '../analytics/clientId'
import {OpenAIError} from '../utils/errors'


async function getCompletionFromProxy(description) {
  let response
  try {
    const url = process.env.PROXY_URL
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
    throw new OpenAIError('Error getting completion from proxy:', e)
  }

  if (!response.ok) {
    throw new OpenAIError(`Proxy response was not ok. Status: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.content
}

export default getCompletionFromProxy
