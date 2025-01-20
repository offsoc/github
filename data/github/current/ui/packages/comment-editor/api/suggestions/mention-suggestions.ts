import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {Mentionable} from '@primer/react/experimental'
import {useCallback} from 'react'
import {useCachedRequest} from '../../util/use-cached-request'
import type {ApiMarkdownSubject} from '../types'

export type MarkdownSuggestedMention = MarkdownSuggestedTeam | MarkdownSuggestedUser

interface MarkdownSuggestedTeam {
  type: 'team'
  id: number
  name: string
  description: string
  participant?: boolean
}

export interface MarkdownSuggestedUser {
  type: 'user'
  id: number
  login: string
  name: string
  participant?: boolean
}

type GetSuggestedMentionsResponse = MarkdownSuggestedMention[]

async function getSuggestedMentions({
  subjectId,
  subjectType,
  subjectRepoId,
}: ApiMarkdownSubject): Promise<GetSuggestedMentionsResponse> {
  const subjectIdParam = subjectId ? `/${subjectId}` : ''

  let queryParams = `?mention_suggester=1`
  queryParams = subjectRepoId ? `${queryParams}&repository_id=${subjectRepoId}` : queryParams

  const suggestionEndpoint = `/suggestions/${subjectType}${subjectIdParam}${queryParams}`

  const response = await verifiedFetchJSON(suggestionEndpoint, {method: 'GET'})
  return (await response.json()) as GetSuggestedMentionsResponse
}

function isUserMention(mention: MarkdownSuggestedMention): mention is MarkdownSuggestedUser {
  return 'login' in mention
}

async function tryGetMentions(request: ApiMarkdownSubject): Promise<Mentionable[]> {
  try {
    const mentionData = await getSuggestedMentions(request)
    return mentionData.map(mention => {
      if (isUserMention(mention)) {
        return {
          description: mention.name,
          identifier: mention.login,
        }
      } else {
        return {
          description: mention.description,
          identifier: mention.name,
        }
      }
    })
  } catch {
    return []
  }
}

export function useGetMentionSuggestions({subjectId, subjectType, subjectRepoId}: Partial<ApiMarkdownSubject>) {
  const request = useCallback(() => {
    if (!subjectType || (subjectType !== 'project' && !subjectRepoId)) return Promise.resolve([])

    return tryGetMentions({
      subjectId,
      subjectType,
      subjectRepoId,
    })
  }, [subjectId, subjectType, subjectRepoId])

  return useCachedRequest(request)
}
