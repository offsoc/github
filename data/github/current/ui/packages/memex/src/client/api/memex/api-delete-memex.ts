import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import {cancelGetAllMemexData} from './api-get-all-memex-data'
import type {DeleteMemexResponse} from './contracts'

export async function apiDeleteMemex(): Promise<DeleteMemexResponse> {
  cancelGetAllMemexData()

  const apiData = getApiMetadata('memex-delete-api-data')
  const {data} = await fetchJSONWith<DeleteMemexResponse>(apiData.url, {
    method: 'DELETE',
  })

  return data
}
