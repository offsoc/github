import {getApiMetadata} from '../../helpers/api-metadata'
import {ContentType} from '../../platform/content-type'
import {wrappedVerifiedFetch} from '../../platform/functional-fetch-wrapper'
import {formEncodeObject} from '../../platform/utils'

/**
 * The 'real' over-the-wire type of the request body. This is a bit cumbersome to work with
 * so we prefer `PreviewMarkdownRequest` instead.
 */
export interface PreviewMarkdownRequestBody {
  text: string
  repository?: number
  issue?: number
  pull_request?: number
  discussion?: number
  subject_type?: string
  project?: number
}

export async function apiPreviewMarkdown(body: PreviewMarkdownRequestBody): Promise<string> {
  const apiData = getApiMetadata('memex-preview-markdown-api-data')

  const response = await wrappedVerifiedFetch(apiData.url, {
    method: 'POST',
    body: formEncodeObject(body),
    headers: {Accept: 'text/html', 'Content-Type': ContentType.FormData},
  })
  return response.text()
}
