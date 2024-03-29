import {Story} from '../utils/story'


export async function analyzeStoryDescription(activeTabUrl){
    if (activeTabUrl.includes('story')) {
        const description = Story.description
        await chrome.runtime.sendMessage({
            action: 'callOpenAI',
            data: {prompt: description}
        })
    }
}