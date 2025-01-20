import {buildTemplate} from '../../helpers/template'

const endpoint = '/enterprises/{slug}/enterprise_licensing/copilot'
const csvEndpoint = `/enterprises/{slug}/enterprise_licensing/copilot/seat_management/download_usage`

export const standaloneCSVEndpoint = buildTemplate(csvEndpoint)
export const standaloneSeatManagementEndpoint = buildTemplate(endpoint)
