import {http, HttpResponse} from 'msw'

import {mockSavedReplies} from '../data/saved-replies'
import type {MarkdownSuggestedMention, MarkdownSuggestedUser} from '../data/suggestions'
import {DefaultMarkdownReferenceSuggestions, MarkdownSuggestionIcons} from '../data/suggestions'
import {mockUsers} from '../data/users'
import {createRequestHandlerWithError, respondWithError, respondWithJsonSuccess} from '../msw-responders'
import {post_getMarkdownPreview} from '../msw-responders/markdown'
import {renderMarkdown} from '../render-markdown'
import {BaseController} from './base-controller'

// IRL, the file store is an external (non dotcom) server where files are published. For
// example, it could be Amazon S3 or a custom Enterprise server.
const fileStoreBaseUrl = new URL('/mock-file-store', window.location.href).toString()
const uploadFileUrl = `${fileStoreBaseUrl}/upload`
const fileBaseUrl = `${fileStoreBaseUrl}/file`
const fileUrl = (id: number, name: string) => `${fileBaseUrl}/${id}/${encodeURIComponent(name)}`

export class MarkdownController extends BaseController {
  public async previewMarkdown({text}: {text: string}): Promise<string> {
    await this.server.sleep()
    return renderMarkdown(text)
  }

  public async getAssetUploadPolicy({name}: Pick<AssetUploadPolicyRequest, 'name'>): Promise<AssetUploadPolicy> {
    return {
      upload_authenticity_token: `mock_authenticity_token_${Math.round(Math.random() * 1000)}`,
      upload_url: uploadFileUrl,
      form: {},
      header: {},
      same_origin: true,
      asset: {
        name,
      },
    }
  }

  public async getMentionSuggestions(): Promise<Array<MarkdownSuggestedMention>> {
    const suggestedUsers: Array<MarkdownSuggestedMention> = mockUsers.map(
      ({avatarUrl, ...u}) =>
        ({...u, participant: true, type: 'user', name: u.name ?? u.login}) as MarkdownSuggestedUser,
    )
    return suggestedUsers.concat(
      [1, 2, 3].map(id => ({
        type: 'team',
        id,
        name: `github/some-team-${id}`,
        description: `${id} team, the best${id % 2 ? ' with also a really long, maybe dynamic description' : ''}`,
      })),
    )
  }

  public async getIssueSuggestions() {
    return {icons: MarkdownSuggestionIcons, suggestions: DefaultMarkdownReferenceSuggestions}
  }

  public override handlers = [
    post_getMarkdownPreview(async (_body, req) => {
      const body = this.formDecodeToObject<{text: string}>(await req.text())
      return this.previewMarkdown(body)
    }),
    http.post('/upload/policies/assets', async ({request}) => {
      const body = this.formDecodeToObject<AssetUploadPolicyRequest>(await request.text())
      return respondWithJsonSuccess(
        this.getAssetUploadPolicy({
          name: body.name || 'unnamed file',
        }),
      )
    }),
    http.get('/suggestions/:subjectType/:subjectId', async ({request}): Promise<Response> => {
      const url = new URL(request.url)
      if (url.searchParams.get('mention_suggester') === '1') {
        return respondWithJsonSuccess(await this.getMentionSuggestions())
      } else if (url.searchParams.get('issue_suggester') === '1') {
        return respondWithJsonSuccess(await this.getIssueSuggestions())
      }
      return respondWithError('Either mention_suggester or issue_suggester must be set', 400)
    }),
    http.get('/settings/replies', async () => respondWithJsonSuccess(mockSavedReplies)),
    http.post(uploadFileUrl, async ({request}) => {
      // uses deprecated `req.body` since `req.formData()` has not been implemented yet
      const file = (await request.formData()).get('file')
      if (!file || typeof file === 'string' || Array.isArray(file)) return new HttpResponse(null, {status: 400})
      // In reality the dotcom logic is more complex than this, but this works for simulating a large file rejection
      if (file.size > 2e7) return new HttpResponse(null, {status: 413})
      const id = this.db.files.add(file)
      // Sleeps for 0.5 - 5 seconds depending on file size up to about 20 MB
      await this.server.sleep(0.0002 * file.size + 500)
      const response: AssetProperties = {
        content_type: file.type,
        href: fileUrl(id, file.name),
        size: file.size,
        name: file.name,
        id,
      }
      return respondWithJsonSuccess(response)
    }),
    http.get(`${fileBaseUrl}/:id/:name`, async ({params}) => {
      if (!params.id) return new HttpResponse(null, {status: 404, statusText: 'File not found'})
      // the :name is ignored - it's just to make a nicer looking URL
      const idStr = typeof params.id === 'string' ? params.id : params.id[0]
      if (idStr == null) return new HttpResponse(null, {status: 404, statusText: 'File not found'})
      const file = this.db.files.byId(+idStr)
      if (!file) return new HttpResponse(null, {status: 404, statusText: 'File not found'})
      return HttpResponse.arrayBuffer(await file.arrayBuffer())
    }),
  ]

  public override errorHandlers = [
    createRequestHandlerWithError('post', 'memex-preview-markdown-api-data', 'Failed to fetch markdown'),
  ]
}

interface AssetProperties {
  id: number
  href: string
  content_type: string
  size: number
  name: string
}

interface AssetUploadPolicyRequest {
  name: string
  size: number
  content_type: string
  authenticity_token?: string
  repository_id?: number
}

interface S3UploadPolicy {
  asset_upload_url: string
  asset_upload_authenticity_token: string
  upload_authenticity_token: string
  upload_url: string
  form: Record<string, string>
  header: Record<string, string>
  same_origin: boolean
  asset: AssetProperties
}

interface EnterpriseUploadPolicy {
  upload_authenticity_token: string
  upload_url: string
  form: Record<string, string>
  header: Record<string, string>
  same_origin: boolean
  asset: {
    name: string
  }
}

type AssetUploadPolicy = S3UploadPolicy | EnterpriseUploadPolicy
