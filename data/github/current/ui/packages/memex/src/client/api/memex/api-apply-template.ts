import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {ApplyTemplateRequest, ApplyTemplateResponse} from './contracts'

export async function apiApplyTemplate(body: ApplyTemplateRequest): Promise<ApplyTemplateResponse> {
  const apiMetadata = getApiMetadata('memex-template-api-data')
  const {data} = await fetchJSONWith<ApplyTemplateResponse>(apiMetadata.url, {method: 'POST', body})
  return data
}
