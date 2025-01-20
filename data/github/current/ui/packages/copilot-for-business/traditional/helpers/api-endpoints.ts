import {buildTemplate} from '../../helpers/template'

const endpoint = '/organizations/{org}/settings/copilot'
export const seatManagementEndpoint = buildTemplate(endpoint)

const csvEndpoint = `/organizations/{slug}/settings/copilot/generate_csv`
export const orgCSVEndpoint = buildTemplate(csvEndpoint)
