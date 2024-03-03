import sleep from './sleep'


async function getEditDescriptionButtonContainer() {
  let descriptionButton = document.querySelector(`[data-on-click="App.Controller.Story.editDescription"]`)
  let container = descriptionButton?.parentElement
  let attempts = 0
  while (container === null) {
    await sleep(1000)
    descriptionButton = document.querySelector(`[data-on-click="App.Controller.Story.editDescription"]`)
    container = descriptionButton?.parentElement
    attempts++
    if (attempts > 10) {
      break
    }
  }
  return container
}

export default getEditDescriptionButtonContainer
