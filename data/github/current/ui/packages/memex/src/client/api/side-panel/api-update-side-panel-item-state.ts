import {getApiMetadata} from '../../helpers/api-metadata'
import {ContentType} from '../../platform/content-type'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import {ItemKeyType, type UpdateIssueStateRequest} from './contracts'

export async function apiUpdateSidePanelItemState(body: UpdateIssueStateRequest): Promise<void> {
  const apiData = getApiMetadata('memex-update-sidepanel-item-state-api-data')
  const url = new URL(apiData.url, window.location.origin)
  url.searchParams.set('kind', ItemKeyType.ISSUE)
  await fetchJSONWith(url.toString(), {
    method: 'POST',
    body,
    contentType: ContentType.FormData,
  })
}
