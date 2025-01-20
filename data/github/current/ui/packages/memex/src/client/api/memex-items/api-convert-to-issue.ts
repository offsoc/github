import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {ConvertDraftItemToIssueRequest, ConvertDraftItemToIssueResponse} from './contracts'

export async function apiConvertToIssue(
  body: ConvertDraftItemToIssueRequest,
): Promise<ConvertDraftItemToIssueResponse> {
  const apiData = getApiMetadata('memex-item-convert-issue-api-data')

  const {data} = await fetchJSONWith<ConvertDraftItemToIssueResponse>(apiData.url, {
    method: 'POST',
    body,
  })
  return data
}
