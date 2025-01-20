import {getApiMetadata} from '../../helpers/api-metadata'
import {debounceAsync, type DebouncedAsyncFunction} from '../../helpers/debounce-async'
import {ApiError} from '../../platform/api-error'
import {fetchJSON} from '../../platform/functional-fetch-wrapper'
import type {GetAllMemexDataRequest, GetAllMemexDataResponse} from './contracts'

/**
 * Why 1250?
 *
 * < 1000 seems to cause a bit of clashing
 * 2000 seems to avoid clashing, but delay updates too much,
 * where users seem likely to miss updates for a while
 *
 * 1250 seems to be a good compromise, but we'll keep tuning
 */
export const REFRESH_DEBOUNCE_TIME = 1250

/**
 * Cancels the debounced getAllMemexData request
 */
export function cancelGetAllMemexData() {
  apiGetAllMemexData.cancel()
}

/**
 * Fetches the complete set of data required for displaying the given memex
 * project in a queued, debounced manner.
 */

export const apiGetAllMemexData: DebouncedAsyncFunction<
  (request: GetAllMemexDataRequest) => Promise<GetAllMemexDataResponse>
> = debounceAsync(async request => {
  const apiData = getApiMetadata('memex-refresh-api-data')
  const {visibleFields} = request
  const url = new URL(apiData.url, window.location.origin)
  if (visibleFields.length > 0) {
    url.searchParams.set('visibleFields', JSON.stringify(visibleFields))
  }

  const {data, ok} = await fetchJSON<GetAllMemexDataResponse>(url)

  if (!ok) {
    throw new ApiError('Unable to refresh project data')
  }

  return data
}, REFRESH_DEBOUNCE_TIME)

/**
 * Fetches the complete set of data required for displaying the given memex
 * project in a single request.
 */
export async function apiGetSingleMemexRefresh(request: GetAllMemexDataRequest): Promise<GetAllMemexDataResponse> {
  const apiData = getApiMetadata('memex-refresh-api-data')
  const {visibleFields} = request
  const url = new URL(apiData.url, window.location.origin)
  if (visibleFields.length > 0) {
    url.searchParams.set('visibleFields', JSON.stringify(visibleFields))
  }

  const {data, ok} = await fetchJSON<GetAllMemexDataResponse>(url)

  if (!ok) {
    throw new ApiError('Unable to refresh project data')
  }

  return data
}
