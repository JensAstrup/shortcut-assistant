import sleep from './sleep'


const WAIT_FOR_PAGE_TO_LOAD_TIMEOUT: number = 1_000
const ENSURE_PAGE_IS_READY_TIMEOUT: number = 500

/**
 * Waits for the story title/name to be present on the page which indicates that the page is ready.
 * @returns {Promise<boolean>} - A promise that resolves to true when the page is ready,
 * and false if the page is not ready after 10 seconds.
 **/
export default async function storyPageIsReady(): Promise<boolean> {
  let storyTitle: Element | null = document.querySelector('.story-name')
  let loop = 0
  while (storyTitle === null && loop < 10) {
    await sleep(loop * WAIT_FOR_PAGE_TO_LOAD_TIMEOUT)
    storyTitle = document.querySelector('.story-name')
    loop += 1
  }
  await sleep(ENSURE_PAGE_IS_READY_TIMEOUT)
  return storyTitle !== null
}
