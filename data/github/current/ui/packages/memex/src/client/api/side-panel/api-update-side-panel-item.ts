import {getApiMetadata} from '../../helpers/api-metadata'
import {ContentType} from '../../platform/content-type'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {SidePanelMetadata, UpdateSidePanelDataRequest} from './contracts'

export async function apiUpdateSidePanelItem(body: UpdateSidePanelDataRequest): Promise<SidePanelMetadata> {
  const apiData = getApiMetadata('memex-update-sidepanel-item-api-data')

  const {data} = await fetchJSONWith<SidePanelMetadata>(apiData.url, {
    method: 'POST',
    body,
    contentType: ContentType.FormData,
  })

  return data
}
