import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSON} from '../../platform/functional-fetch-wrapper'
import type {GetCustomTemplatesResponse} from './contracts'

export async function apiGetCustomTemplates(): Promise<GetCustomTemplatesResponse> {
  const apiData = getApiMetadata('memex-custom-templates-api-data')
  const {data} = await fetchJSON<GetCustomTemplatesResponse>(apiData.url)
  return data
}
