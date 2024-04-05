import {getActiveTab} from './get-active-tab'


export async function getActiveTabUrl() {
    const activeTab = await getActiveTab()
    return activeTab?.url
}
