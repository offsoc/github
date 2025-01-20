import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {MemexWithoutLimitsBetaOptoutResponse} from './contracts'

export async function apiMemexWithoutLimitsBetaOptout(): Promise<MemexWithoutLimitsBetaOptoutResponse> {
  const apiData = getApiMetadata('memex-without-limits-beta-optout-api-data')
  const {data} = await fetchJSONWith<MemexWithoutLimitsBetaOptoutResponse>(apiData.url, {method: 'POST'})
  return data
}
