import {getActiveTab} from './getActiveTab'


export async function getActiveTabUrl() {
    const activeTab = await getActiveTab()
    return activeTab?.url
}
