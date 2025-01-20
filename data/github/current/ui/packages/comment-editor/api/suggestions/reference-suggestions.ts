import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {Reference} from '@primer/react/drafts'
import {useCallback} from 'react'
import {useCachedRequest} from '../../util/use-cached-request'
import type {ApiMarkdownSubject} from '../types'

type SuggestedReferenceType =
  | 'discussion'
  | 'issue_open'
  | 'issue_closed'
  | 'pull_request'
  | 'pull_request_closed'
  | 'pull_request_draft'
  | 'skip'

interface MarkdownSuggestedReference {
  id: number
  number: number
  /** Item title as HTML (can include, for example, emoji and `<code>` tags). */
  title: string
  type: SuggestedReferenceType
}

type SuggestedIssueIconsMap = {[key in SuggestedReferenceType]: string}

interface GetSuggestedReferencesResponse {
  /**
   * This icons is a map of issue type to icon strings that has items that look like:
   * discussion: "<svg class=\"octicon octicon-comment-discussion\">...</svg>"
   */
  icons: SuggestedIssueIconsMap
  suggestions: MarkdownSuggestedReference[]
}

async function getSuggestedReferences({
  subjectId,
  subjectType,
  subjectRepoId,
}: ApiMarkdownSubject): Promise<GetSuggestedReferencesResponse> {
  const subjectIdParam = subjectId ? `/${subjectId}` : ''
  const response = await verifiedFetchJSON(
    `/suggestions/${subjectType}${subjectIdParam}?issue_suggester=1&repository_id=${subjectRepoId}`,
    {method: 'GET'},
  )

  return (await response.json()) as GetSuggestedReferencesResponse
}

async function tryGetReferences(request: ApiMarkdownSubject): Promise<Reference[]> {
  try {
    const referenceData = await getSuggestedReferences(request)
    const iconMap = referenceData.icons
    return referenceData.suggestions.map(reference => ({
      id: reference.number.toString(),
      titleText: reference.title,
      titleHtml: reference.title,
      iconHtml: iconMap[reference.type],
    }))
  } catch {
    return []
  }
}

export function useGetReferenceSuggestions({subjectId, subjectType, subjectRepoId}: Partial<ApiMarkdownSubject>) {
  const request = useCallback(async () => {
    if (!subjectType || !subjectRepoId) return Promise.resolve([])

    return tryGetReferences({
      subjectId,
      subjectType,
      subjectRepoId,
    })
  }, [subjectId, subjectType, subjectRepoId])

  return useCachedRequest(request)
}
