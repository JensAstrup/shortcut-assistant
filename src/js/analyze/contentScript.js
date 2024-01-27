import {sleep} from '../utils'


export function extractStoryDescription() {
    const descriptionDiv = document.querySelector('[data-key="description"]')
    return descriptionDiv.textContent
}

export function resizeTextareaToFitContent(textarea) {
    textarea.style.height = textarea.scrollHeight + 'px'
}

export async function populateCommentBox(response) {
    const commentBox = document.querySelector('.textfield')
    if (commentBox) {
        commentBox.click()
        await sleep(100)
        const inputFieldParent = document.querySelector('[data-on-mouseup="App.Controller.Comment.handleOnMouseUp"]')
        const content = '✨ Generated by Story Readiness Assistant GPT ✨\n\n' + response
        if (!inputFieldParent.value.includes(content)) {
            inputFieldParent.value = content
        }
        resizeTextareaToFitContent(inputFieldParent)
        await chrome.runtime.sendMessage({message: 'OpenAIResponseCompleted'})
    }
}

export async function analyzeStoryDescription(activeTabUrl) {
    if (activeTabUrl.includes('story')) {
        const description = extractStoryDescription()
        const response = await chrome.runtime.sendMessage({action: 'callOpenAI', data: {prompt: description}})
        if (response.error) {
            await chrome.runtime.sendMessage({error: 'OpenAIResponseFailed'})
            return
        }
        await populateCommentBox(response.data)
    }
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.onMessage.addListener(
        async function (request, sender, sendResponse) {
            const activeTabUrl = window.location.href
            if (request.message === 'analyzeStoryDescription') {
                await analyzeStoryDescription(activeTabUrl)
            }
        })
})
