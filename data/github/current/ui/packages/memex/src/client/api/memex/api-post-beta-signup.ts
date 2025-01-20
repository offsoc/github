import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {MemexWithoutLimitsBetaSignupResponse} from './contracts'

export async function apiMemexWithoutLimitsBetaSignup(): Promise<MemexWithoutLimitsBetaSignupResponse> {
  const apiData = getApiMetadata('memex-without-limits-beta-signup-api-data')
  const {data} = await fetchJSONWith<MemexWithoutLimitsBetaSignupResponse>(apiData.url, {method: 'POST'})
  return data
}
