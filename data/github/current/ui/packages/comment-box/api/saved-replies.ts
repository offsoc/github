import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {SavedReply} from '@primer/react/drafts'
import {useCachedRequest} from '../util/use-cached-request'
import type {ApiMarkdownSubject, SavedRepliesContext} from './types'
import {useCallback} from 'react'

interface SettingsSavedReply {
  id: number
  title: string
  body: string
  default: boolean
}

async function tryGetSavedReplies(savedRepliesContext?: SavedRepliesContext): Promise<SavedReply[]> {
  try {
    const response = await verifiedFetchJSON(
      `/settings/replies${savedRepliesContext ? `?context=${savedRepliesContext}` : ''}`,
    )
    const replies = (await response.json()) as SettingsSavedReply[]
    return replies.map(reply => ({
      name: reply.title,
      content: reply.body,
    }))
  } catch {
    return []
  }
}

export function useGetSavedReplies({subjectType}: Partial<ApiMarkdownSubject>) {
  const request = useCallback(() => {
    const savedRepliesContext = subjectType === 'issue' || subjectType === 'pull_request' ? subjectType : undefined

    return tryGetSavedReplies(savedRepliesContext)
  }, [subjectType])

  return useCachedRequest(request)
}
