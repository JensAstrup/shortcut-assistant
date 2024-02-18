export class Story{
    static get description(){
        const descriptionDiv = document.querySelector('[data-key="description"]')
        return descriptionDiv.textContent
    }
}