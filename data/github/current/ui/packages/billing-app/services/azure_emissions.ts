import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {EmissionDate} from '../types/azure-emissions'

export const getAzureEmissionsRequest = async (enterpriseSlug: string, emissionDate: EmissionDate) => {
  const url = `/stafftools/enterprises/${enterpriseSlug}/billing/azure_emissions?year=${emissionDate.year}&month=${emissionDate.month}&day=${emissionDate.day}`
  const response = await verifiedFetchJSON(url, {method: 'GET'})
  const data = await response.json()
  return {...data, statusCode: response.status}
}
