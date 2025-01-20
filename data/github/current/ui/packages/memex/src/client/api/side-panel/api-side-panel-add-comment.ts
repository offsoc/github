import {getApiMetadata} from '../../helpers/api-metadata'
import {ContentType} from '../../platform/content-type'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {AddCommentRequest, IssueComment} from './contracts'

export async function apiSidePanelAddComment(body: AddCommentRequest): Promise<IssueComment> {
  const apiData = getApiMetadata('memex-comment-on-sidepanel-item-api-data')

  const {data} = await fetchJSONWith<IssueComment>(apiData.url, {
    method: 'POST',
    body,
    contentType: ContentType.FormData,
  })

  return data
}
