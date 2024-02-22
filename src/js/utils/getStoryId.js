import {getActiveTabUrl} from './getActiveTabUrl'


export async function getStoryId() {
  const url = await getActiveTabUrl()
  const match = url.match(/\/story\/(\d+)/)

  return match ? match[1] : null
}