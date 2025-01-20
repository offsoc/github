import {getApiMetadata} from '../../helpers/api-metadata'
import {ContentType} from '../../platform/content-type'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {EditCommentRequest, IssueComment} from './contracts'

export async function apiSidePanelEditComment(body: EditCommentRequest): Promise<IssueComment> {
  const apiData = getApiMetadata('memex-edit-sidepanel-comment-api-data')

  const {data} = await fetchJSONWith<IssueComment>(apiData.url, {
    method: 'PUT',
    body,
    contentType: ContentType.FormData,
  })

  return data
}
