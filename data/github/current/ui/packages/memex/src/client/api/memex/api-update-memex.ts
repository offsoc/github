import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import {cancelGetAllMemexData} from './api-get-all-memex-data'
import type {IUpdateMemexRequest, UpdateMemexResponse} from './contracts'

export async function apiUpdateMemex(body: IUpdateMemexRequest): Promise<UpdateMemexResponse> {
  cancelGetAllMemexData()

  const apiData = getApiMetadata('memex-update-api-data')

  const {data} = await fetchJSONWith<UpdateMemexResponse>(apiData.url, {
    method: 'PUT',
    body,
  })
  return data
}
