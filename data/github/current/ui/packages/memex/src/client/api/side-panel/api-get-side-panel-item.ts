import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSON, type RequestInitOverride} from '../../platform/functional-fetch-wrapper'
import {type GetSidePanelDataRequest, ItemKeyType, type SidePanelMetadata} from './contracts'

export async function apiGetSidePanelItem(
  request: GetSidePanelDataRequest,
  opts?: RequestInitOverride,
): Promise<SidePanelMetadata> {
  const apiData = getApiMetadata('memex-get-sidepanel-item-api-data')
  const url = new URL(apiData.url, window.location.origin)
  switch (request.kind) {
    case ItemKeyType.ISSUE: {
      url.searchParams.set('kind', request.kind)
      url.searchParams.set('item_id', `${request.itemId}`)
      url.searchParams.set('repository_id', `${request.repositoryId}`)
      url.searchParams.set('omit_comments', `${request.omitComments ?? false}`)
      url.searchParams.set('omit_capabilities', `${request.omitCapabilities ?? false}`)
      break
    }

    case ItemKeyType.PROJECT_DRAFT_ISSUE:
      url.searchParams.set('kind', request.kind)
      url.searchParams.set('project_item_id', `${request.projectItemId}`)
      break
  }

  const {data} = await fetchJSON<SidePanelMetadata>(url, opts)

  return data
}
