import {getApiMetadata} from '../../helpers/api-metadata'
import {debounceAsync, type DebouncedAsyncFunction} from '../../helpers/debounce-async'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'

export const apiSubscribe: DebouncedAsyncFunction<() => Promise<void>> = debounceAsync(async () => {
  const apiData = getApiMetadata('memex-notification-subscription-create-api-data')
  await fetchJSONWith(apiData.url, {method: 'POST'})
}, 500)

export const apiUnsubscribe: DebouncedAsyncFunction<() => Promise<void>> = debounceAsync(async () => {
  const apiData = getApiMetadata('memex-notification-subscription-destroy-api-data')
  await fetchJSONWith(apiData.url, {method: 'DELETE'})
}, 500)
