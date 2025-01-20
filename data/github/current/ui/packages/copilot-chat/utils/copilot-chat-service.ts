import {CopilotAuthTokenProvider} from '@github-ui/copilot-auth-token'
import {blobDetectLanguage, treeListPath} from '@github-ui/paths'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

import {ApiCache} from './api-cache'
import type {
  APIResult,
  APIStreamingResult,
  BlackbirdSuggestion,
  CopilotChatAgent,
  CopilotChatMessage,
  CopilotChatOrg,
  CopilotChatReference,
  CopilotChatRepo,
  CopilotChatSuggestions,
  CopilotChatThread,
  CopilotClientConfirmation,
  Docset,
  FailedAPIResult,
  FileReference,
  KnowledgeBasesResponse,
  ReferenceDetails,
  SuggestionsResponse,
} from './copilot-chat-types'
import {getCopilotExperiments} from './experiments'

const BLACKBIRD_SUGGESTION_KIND = 'SUGGESTION_KIND_SYMBOL'
const HYDRATABLE_REFERENCE_TYPES = new Set(['snippet', 'file', 'symbol', 'docset', 'repository'])

type ListMessagesPayload = {
  thread: CopilotChatThread
  messages: CopilotChatMessage[]
}

type FeedbackPayload = {
  feedback?: string
  textResponse?: string
  feedbackChoice?: string[]
  isContactedChecked?: string | null
  messageId: string
  threadId: string | undefined
}

type APIPayload = CreateMessagePayload

type CreateMessagePayload = {
  content: string
  intent: string
  references: CopilotChatReference[]
  currentURL: string
  streaming?: boolean
  context: CopilotChatReference[]
  confirmations: CopilotClientConfirmation[]
  customInstructions?: string[]
  knowledgeBases?: Docset[]
}

export const ERRORS: {[key: number]: string} = {
  400: 'This message could not be processed.',
  401: 'You’re not authorized to use Copilot.',
  403: 'This response could not be shown as it violates GitHub’s content policies.',
  404: 'Resource not found. Please try again.',
  408: 'Your network connection was interrupted. Please try again.',
  413: 'Message too large. Please shorten it or remove some references and try again.',
  429: 'GitHub API rate limit exceeded. Please wait and try again.',
}

interface FetchThreadsParams {
  /* Filter threads to just those with the specified name, case sensitive */
  name?: string | undefined | null
}

export class CopilotChatService {
  apiURL: string
  urlPathPrefix = '/github-copilot/chat'
  ERROR_MSG = "I'm sorry but there was an error. Please try again."
  docsetsPromise: Promise<APIResult<KnowledgeBasesResponse>> | undefined = undefined
  repoDetailsCache = new Map<number | string, CopilotChatRepo>()
  listMessagesCache: ListMessagesPayload | undefined = undefined
  copilotAuthTokenProvider: CopilotAuthTokenProvider

  constructor(apiURL: string, ssoOrgs: CopilotChatOrg[]) {
    this.apiURL = apiURL
    this.copilotAuthTokenProvider = new CopilotAuthTokenProvider(ssoOrgs.map(org => org.id))
  }

  async fetchThreads(params: FetchThreadsParams = {}): Promise<APIResult<CopilotChatThread[]>> {
    const queryParams = new URLSearchParams()
    if (typeof params.name === 'string') queryParams.set('name', params.name)
    const pathWithParams = `/threads?${queryParams.toString()}`
    const res = await this.makeCAPIRequest(pathWithParams, 'GET')
    if (!res.ok) return res as FailedAPIResult

    const payload: CopilotChatThread[] = (await res.json()).threads || []
    return {status: res.status, ok: true, payload}
  }

  async createThread(): Promise<APIResult<CopilotChatThread>> {
    const res = await this.makeCAPIRequest(`/threads`, 'POST')
    if (!res.ok) return res as FailedAPIResult

    const payload: CopilotChatThread = (await res.json()).thread
    return {status: res.status, ok: true, payload}
  }

  async deleteThread(threadID: string): Promise<APIResult<null>> {
    const res = await this.makeCAPIRequest(`/threads/${threadID}`, 'DELETE')
    if (!res.ok) return res as FailedAPIResult

    return {status: res.status, ok: true, payload: null}
  }

  async renameThread(threadID: string, newName: string): Promise<APIResult<string>> {
    const body = {generate: false, name: newName}

    const res = await this.makeCAPIRequest(`/threads/${threadID}/name`, 'PATCH', body)
    if (!res.ok) return res as FailedAPIResult

    const payload: string = (await res.json()).name || ''
    return {status: res.status, ok: true, payload}
  }

  async clearThread(threadID: string): Promise<APIResult<null>> {
    const res = await this.makeCAPIRequest(`/threads/${threadID}/clear`, 'PATCH')
    if (!res.ok) return res as FailedAPIResult

    return {status: res.status, ok: true, payload: null}
  }

  async generateThreadName(threadID: string): Promise<APIResult<string>> {
    const body = {generate: true, name: ''}

    const res = await this.makeCAPIRequest(`/threads/${threadID}/name`, 'PATCH', body)
    if (!res.ok) return res as FailedAPIResult

    const payload: string = (await res.json()).name || ''
    return {status: res.status, ok: true, payload}
  }

  async listMessages(threadID: string): Promise<APIResult<ListMessagesPayload>> {
    if (this.listMessagesCache?.thread.id === threadID) {
      return {status: 200, ok: true, payload: this.listMessagesCache}
    }

    const res = await this.makeCAPIRequest(`/threads/${threadID}/messages`, 'GET')
    if (!res.ok) return res as FailedAPIResult

    const payload = await res.json()
    this.listMessagesCache = payload
    return {status: res.status, ok: true, payload}
  }

  async createMessage(
    threadID: string,
    content: string,
    intent: string,
    references: CopilotChatReference[],
    customInstructions?: string[],
  ): Promise<APIResult<CopilotChatMessage>> {
    this.listMessagesCache = undefined
    const res = await this.makeCAPIRequest(`/threads/${threadID}/messages`, 'POST', {
      content,
      intent,
      references,
      currentURL: window.location.href,
      customInstructions,
    })
    if (!res.ok) return res as FailedAPIResult

    const payload: CopilotChatMessage = (await res.json()).message
    return {status: res.status, ok: true, payload}
  }

  async createMessageStreaming(
    threadID: string,
    content: string,
    intent: string,
    references: CopilotChatReference[],
    context: CopilotChatReference[],
    confirmations: CopilotClientConfirmation[],
    customInstructions?: string[],
    knowledgeBases?: Docset[],
  ): Promise<APIStreamingResult> {
    this.listMessagesCache = undefined
    const body: CreateMessagePayload = {
      content,
      intent,
      references,
      context,
      currentURL: window.location.href,
      streaming: true,
      confirmations,
      customInstructions,
      knowledgeBases,
    }

    const res = await this.makeCAPIRequest(`/threads/${threadID}/messages`, 'POST', body, true)
    if (!res.ok) return res as FailedAPIResult

    return {status: res.status, ok: true, response: res}
  }

  async sendFeedback({feedback, feedbackChoice, messageId, threadId, textResponse}: FeedbackPayload) {
    const body = {
      feedback,
      feedback_choice: feedbackChoice,
      message_id: messageId,
      thread_id: threadId,
      text_response: textResponse,
    }
    const res = await this.makeDotcomRequest(`${this.urlPathPrefix}/feedback`, 'POST', body)
    if (!res.ok) return res as FailedAPIResult

    return {status: res.status, ok: true, payload: null}
  }

  async listDocsets(): Promise<APIResult<Docset[]>> {
    const response = await this.fetchDocsetsResponse()
    if (!response.ok) return response
    return {status: 200, ok: true, payload: response.payload.knowledgeBases}
  }

  // The response from the server will be null if the user has access to one or more knowledge bases. That is because
  // we only use the administratedCopilotEnterpriseOrganizations if there are no knowledge bases. So to save executing a bunch
  // of queries to get administrated orgs and check if they have Copilot Enterprise we just return null in that case.
  //
  // We could have made a separate API endpoint to get a list of administratedCopilotEnterpriseOrganizations and only called it
  // if there are no knowledge bases, but this would result in a layout shift when the response comes in and we render
  // a different set of HTML if there are orgs.
  //
  // In the future we may need a separate endpoint if we need administratedCopilotEnterpriseOrganizations elsewhere but for now
  // this is a much higher performance way to get this information without layout shifting.
  //
  // See the issue this fixes: https://github.com/github/copilot-core-productivity/issues/1443
  async listAdministratedCopilotEnterpriseOrganizations(): Promise<APIResult<CopilotChatOrg[] | null>> {
    const response = await this.fetchDocsetsResponse()
    if (!response.ok) return response
    return {status: 200, ok: true, payload: response.payload.administratedCopilotEnterpriseOrganizations}
  }

  fetchDocsetsResponse(): Promise<APIResult<KnowledgeBasesResponse>> {
    if (!this.docsetsPromise) {
      this.docsetsPromise = this.docsetRequestPromise()
    }
    return this.docsetsPromise
  }

  async docsetRequestPromise(): Promise<APIResult<KnowledgeBasesResponse>> {
    const res = await this.makeDotcomRequest(`/github-copilot/docs/docsets`, 'GET')
    if (!res.ok) return res as FailedAPIResult
    const payload = (await res.json()) as KnowledgeBasesResponse
    return {status: 200, ok: true, payload}
  }

  async deleteDocset(docset: Docset) {
    const res = await this.makeDotcomRequest(`/copilot/docsets/${docset.id}`, 'DELETE')
    if (!res.ok) return res as FailedAPIResult
    return {status: res.status, ok: true, payload: null}
  }

  async listRepoFiles(repo: CopilotChatRepo): Promise<APIResult<string[]>> {
    const path = treeListPath({repo, commitOid: repo.commitOID, includeDirectories: false})
    return this.repoFilesCache.get(path)
  }

  private listRepoFilesImpl = async (path: string): Promise<APIResult<string[]>> => {
    const res = await this.makeDotcomRequest(path, 'GET')
    if (!res.ok) return res as FailedAPIResult

    const payload = (await res.json()).paths || []

    return {status: 200, ok: true, payload}
  }
  private repoFilesCache = new ApiCache(this.listRepoFilesImpl)

  async querySymbols(repo: CopilotChatRepo, query: string): Promise<APIResult<BlackbirdSuggestion[]>> {
    return this.querySymbolsCache.get(repo.ownerLogin, repo.name, query)
  }

  private querySymbolsImpl = async (
    ownerLogin: string,
    repo: string,
    query: string,
  ): Promise<APIResult<BlackbirdSuggestion[]>> => {
    const response = await this.makeDotcomRequest(
      `/search/suggestions?query=repo:${ownerLogin}/${repo} ${query}`,
      'GET',
    )

    if (!response.ok) {
      return response as FailedAPIResult
    }

    const payload = (await response.json()) as SuggestionsResponse

    return {
      status: 200,
      ok: true,
      payload: payload.suggestions.filter(suggestion => suggestion.kind === BLACKBIRD_SUGGESTION_KIND),
    }
  }
  private querySymbolsCache = new ApiCache(this.querySymbolsImpl)

  async fetchImplicitContext(
    url: string,
    owner: string,
    repo: string,
  ): Promise<APIResult<CopilotChatReference | CopilotChatReference[]>> {
    const response = await this.makeDotcomRequest(
      `${this.urlPathPrefix}/implicit-context/${owner}/${repo}/${encodeURIComponent(url)}`,
      'GET',
    )

    if (!response.ok) return response as FailedAPIResult

    return {
      status: response.status,
      ok: response.ok,
      payload: await response.json(),
    }
  }

  async fetchRepo(repoID: number | string): Promise<APIResult<CopilotChatRepo>> {
    let payload: CopilotChatRepo
    if (this.repoDetailsCache.has(repoID)) {
      payload = this.repoDetailsCache.get(repoID)!
    } else {
      const res = await this.makeDotcomRequest(`${this.urlPathPrefix}/repositories/${repoID}`, 'GET')
      if (!res.ok) return res as FailedAPIResult

      payload = await res.json()
      this.repoDetailsCache.set(repoID, payload)
    }

    return {status: 200, ok: true, payload}
  }

  async listAgents(agentsPath: string): Promise<APIResult<CopilotChatAgent[]>> {
    const res = await verifiedFetchJSON(agentsPath)
    if (!res.ok) return {status: res.status, ok: false, error: ERRORS[res.status] || this.ERROR_MSG}
    const payload = await res.json()
    return {status: res.status, ok: res.ok, payload}
  }

  async hydrateReference<T extends CopilotChatReference>(reference: T): Promise<APIResult<ReferenceDetails<T>>> {
    if (!HYDRATABLE_REFERENCE_TYPES.has(reference.type)) {
      return {
        status: 204,
        ok: true,
        payload: reference as ReferenceDetails<T>,
      }
    }
    const response = await this.makeDotcomRequest(`${this.urlPathPrefix}/reference_details`, 'POST', {reference})

    if (!response.ok) return response as FailedAPIResult

    return {
      status: response.status,
      ok: response.ok,
      payload: await response.json(),
    }
  }

  async fetchLanguageForFileReference(reference: FileReference) {
    const {repoOwner: ownerLogin, repoName: name} = reference
    const path = window.btoa(reference.path)
    const repo = {ownerLogin, name}
    const fetchPath = blobDetectLanguage(repo, path, true)

    const response = await this.makeDotcomRequest(fetchPath, 'GET')

    if (!response.ok) return response as FailedAPIResult

    return {
      status: response.status,
      ok: response.ok,
      payload: await response.json(),
    }
  }

  async generateSuggestions(
    context: CopilotChatReference | CopilotChatRepo | Docset,
    threadID: string,
  ): Promise<APIResult<CopilotChatSuggestions>> {
    const body = {context: [context], currentUrl: `${window.location.href}`}

    const response = await this.makeCAPIRequest(`/threads/${threadID}/suggestions`, 'POST', body)
    if (!response.ok) return response as FailedAPIResult
    const payload = await response.json()

    return {
      status: response.status,
      ok: response.ok,
      payload,
    }
  }

  protected async makeDotcomRequest(
    path: string,
    method: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT',
    body?: object | APIPayload,
  ): Promise<Response | FailedAPIResult> {
    const headers: {[key: string]: string} = {}
    for (const exp of getCopilotExperiments()) {
      const components = exp.split('=')
      const name = components[0]?.replaceAll('_', '-')
      let value = '1'
      if (components.length > 1) {
        value = components[1]!
      }
      headers[`X-Experiment-${name}`] = value
    }

    const token = await this.copilotAuthTokenProvider.getAuthToken()
    headers['X-Copilot-Api-Token'] = token.value

    try {
      const res = await verifiedFetchJSON(path, {method, body, headers})
      if (res.ok) return res
      return {status: res.status, ok: false, error: ERRORS[res.status] || this.ERROR_MSG}
    } catch (error) {
      return {status: 500, ok: false, error: this.ERROR_MSG}
    }
  }

  private get directConnectConfiguration() {
    return process.env.NODE_ENV === 'development'
      ? {integrationID: 'copilot-chat-dev'}
      : {integrationID: 'copilot-chat'}
  }

  private async makeCAPIRequest(
    path: string,
    method: 'GET' | 'POST' | 'DELETE' | 'PATCH',
    body?: object | APIPayload,
    streamingResponse = false,
    basePath = '/github/chat',
  ): Promise<Response | FailedAPIResult> {
    try {
      const baseURL = this.apiURL

      const token = await this.copilotAuthTokenProvider.getAuthToken()

      const headers: {[key: string]: string} = {
        Authorization: token.authorizationHeaderValue,
        'copilot-integration-id': this.directConnectConfiguration.integrationID,
      }
      for (const exp of getCopilotExperiments()) {
        const components = exp.split('=')
        const name = components[0]?.replaceAll('_', '-')
        let value = '1'
        if (components.length > 1) {
          value = components[1]!
        }
        headers[`X-Experiment-${name}`] = value
      }

      if (streamingResponse) {
        headers['Content-Type'] = 'text/event-stream'
      }

      const res = await fetch(baseURL + basePath + path, {
        method,
        mode: 'cors',
        cache: 'no-cache',
        headers,
        body: JSON.stringify(body),
      })

      if (res.ok) return res
      return {status: res.status, ok: false, error: ERRORS[res.status] || this.ERROR_MSG}
    } catch (error) {
      return {status: 500, ok: false, error: this.ERROR_MSG}
    }
  }
}
