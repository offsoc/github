import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import {mostRecentUpdateSingleton} from '../../state-providers/data-refresh/most-recent-update'
import {pendingUpdatesSingleton} from '../../state-providers/data-refresh/pending-updates'
import type {IUpdateMemexItemRequest, UpdateMemexItemResponse} from './contracts'

export async function apiUpdateItem(body: IUpdateMemexItemRequest): Promise<UpdateMemexItemResponse> {
  const apiData = getApiMetadata('memex-item-update-api-data')

  pendingUpdatesSingleton.increment()
  try {
    const {data} = await fetchJSONWith<UpdateMemexItemResponse>(apiData.url, {
      method: 'PUT',
      body,
    })
    // updatedAt should always be present after an update call, but we have to default it just in case, so default
    // it to a time that would always allow a live update
    mostRecentUpdateSingleton.set(new Date(data.memexProjectItem.updatedAt || 0).getTime())
    pendingUpdatesSingleton.decrement()
    return data
  } catch (e) {
    pendingUpdatesSingleton.decrement()
    throw e
  }
}
