import {getStoryId} from "./utils";


export function getNotesKey(storyId) {
    return "notes_" + storyId;
}


export async function getNotes() {
    const storyId = await getStoryId();
    const key = getNotesKey(storyId);
    const result = await chrome.storage.sync.get(key);
    return result[key];
}
