import {CopilotChatService, ERRORS} from '@github-ui/copilot-chat/utils/copilot-chat-service'
import type {Docset, DocsetRepo, FailedAPIResult, RepoData} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {createContext} from 'react'
import type {KnowledgeBaseOwner} from '../routes/payloads'
import {makeScopingQuery, makeSourceRepos} from './docset'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

export default class CopilotChatSettingsService extends CopilotChatService {
  async fetchKnowledgeBases(owner: string) {
    const response = await this.makeDotcomRequest(
      `/organizations/${owner}/settings/copilot/chat_settings/knowledge_bases`,
      'GET',
    )

    if (!response.ok) {
      throw new Error(`An error occurred: ${response.status}`)
    }

    return ((await response.json()) as {knowledgeBases: Docset[]}).knowledgeBases
  }

  async fetchKnowledgeBase(owner: string, id: string) {
    const response = await this.makeDotcomRequest(
      `/organizations/${owner}/settings/copilot/chat_settings/knowledge_bases/${id}`,
      'GET',
    )

    if (!response.ok) {
      throw new Error(`An error occurred: ${response.status}`)
    }

    return (await response.json()) as {
      docset: Docset
      repoData: RepoData[]
      docsetOwner: KnowledgeBaseOwner
    }
  }

  async createKnowledgeBase(owner: KnowledgeBaseOwner, name: string, description: string, repos: DocsetRepo[]) {
    const response = await this.makeDotcomRequest(
      `/organizations/${owner.displayLogin}/settings/copilot/chat_settings`,
      'POST',
      {
        name,
        ownerId: owner.id,
        ownerType: owner.isOrganization ? 'organization' : 'user',
        description,
        repos: repos.map(r => r.nameWithOwner),
        visibility: 'private',
        scopingQuery: makeScopingQuery(repos),
        sourceRepos: makeSourceRepos(repos),
      },
    )

    if (!response.ok) {
      if (response.status === 400) {
        return (response as FailedAPIResult).error
      }
      return `An error occurred: ${response.status}`
    }

    const knowledgeBase = (await response.json()) as {id?: string} | undefined
    if (!knowledgeBase?.id) return undefined // This is not expected
  }

  async updateKnowledgeBase(
    knowledgeBase: Docset,
    owner: KnowledgeBaseOwner,
    name: string,
    description: string,
    repos: DocsetRepo[],
  ) {
    const response = await this.makeDotcomRequest(
      `/organizations/${owner.displayLogin}/settings/copilot/chat_settings/${knowledgeBase.id}`,
      'PUT',
      {
        name,
        description,
        ownerId: owner.id, // Passing the owner ID so we can look up the owner without making another CAPI request to get the kb / owner
        repos: repos.map(r => r.nameWithOwner),
        visibility: 'private',
        scopingQuery: makeScopingQuery(repos),
        sourceRepos: makeSourceRepos(repos),
      },
    )

    if (!response.ok) {
      throw new Error(`An error occurred: ${response.status}`)
    }
  }

  async deleteKnowledgeBase(owner: string, knowledgeBase: Docset) {
    const response = await this.makeDotcomRequest(
      `/organizations/${owner}/settings/copilot/chat_settings/${knowledgeBase.id}`,
      'DELETE',
      {
        ownerId: knowledgeBase.ownerID,
        name: knowledgeBase.name,
      },
    )

    if (!response.ok) {
      throw new Error(`An error occurred: ${response.status}`)
    }
  }

  async validateKnowledgeBaseNameAvailability(owner: KnowledgeBaseOwner, name: string) {
    const response = await this.makeDotcomRequest(
      `/organizations/${owner.displayLogin}/settings/copilot/chat_settings/check_name`,
      'POST',
      {
        ownerType: owner.isOrganization ? 'organization' : 'user',
        ownerID: owner.id,
        name,
      },
    )

    if (!response.ok) {
      throw new Error(`An error occurred: ${response.status}`)
    }

    const {available} = (await response.json()) as {available: boolean}

    return available
  }

  protected override async makeDotcomRequest(
    path: string,
    method: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT',
    body?: object,
  ): Promise<Response | FailedAPIResult> {
    const headers: {[key: string]: string} = {}

    const token = await this.copilotAuthTokenProvider.getAuthToken()
    headers['X-Copilot-Api-Token'] = token.value

    try {
      const res = await verifiedFetchJSON(path, {method, body, headers})

      if (res.ok) {
        return res
      }

      let error = this.ERROR_MSG

      try {
        const payload = await res.json()
        // if this has an errors array, we'll return the detail from the first error
        if (payload.errors?.length && payload.errors[0].detail) {
          error = payload.errors[0].detail
        }
      } catch {
        error = ERRORS[res.status] || this.ERROR_MSG
      }

      return {status: res.status, ok: false, error}
    } catch (error) {
      return {status: 500, ok: false, error: this.ERROR_MSG}
    }
  }
}

export const CopilotChatSettingsServiceContext = createContext(new CopilotChatSettingsService('', []))
