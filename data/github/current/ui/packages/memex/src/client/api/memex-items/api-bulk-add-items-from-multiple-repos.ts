import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith, fetchPoll} from '../../platform/functional-fetch-wrapper'
import type {ColumnUpdateData} from '../columns/contracts/storage'
import type {BulkAddItem, BulkAddMemexItemsResponse} from './contracts'
import {ItemType} from './item-type'

export async function apiBulkAddItemsFromMultipleRepos(
  itemsToAdd: Array<BulkAddItem>,
  memexProjectColumnValues?: Array<ColumnUpdateData>,
): Promise<boolean> {
  const issueReferencesString = itemsToAdd.map(item => ` ${item.userName}/${item.repoName}#${item.number}`).join(',')
  const body = {
    memexProjectItem: {
      contentType: ItemType.DraftIssue,
      content: {title: issueReferencesString},
      memexProjectColumnValues,
    },
  }

  const apiData = getApiMetadata('memex-item-create-bulk-api-data')
  const {data} = await fetchJSONWith<BulkAddMemexItemsResponse>(apiData.url, {
    method: 'POST',
    body,
  })
  const jobResponse = await fetchPoll(data.job.url, {headers: {accept: 'application/json'}})
  return jobResponse.ok
}
