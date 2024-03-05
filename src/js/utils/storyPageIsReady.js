import sleep from './sleep'


async function storyPageIsReady() {
  let storyTitle = document.querySelector('.story-name')
  let loop = 0
  while (storyTitle === null) {
    await sleep(loop * 1000)
    storyTitle = document.querySelector('.story-name')
    loop += 1.5
  }
  await sleep(500)
  return true
}

export default storyPageIsReady
