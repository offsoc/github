import {getApiMetadata} from '../../helpers/api-metadata'
import {ContentType} from '../../platform/content-type'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {UpdateSidePanelItemReactionRequest} from './contracts'

export async function apiUpdateSidePanelItemReaction(body: UpdateSidePanelItemReactionRequest): Promise<void> {
  const apiData = getApiMetadata('memex-update-sidepanel-item-reaction-api-data')
  await fetchJSONWith(apiData.url, {
    method: 'POST',
    body,
    contentType: ContentType.FormData,
  })
}
