import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {SavedReply} from '@primer/react/drafts'
import {useCachedRequest} from '../util/use-cached-request'

interface SettingsSavedReply {
  id: number
  title: string
  body: string
  default: boolean
}

async function tryGetSavedReplies(): Promise<SavedReply[]> {
  try {
    const response = await verifiedFetchJSON('/settings/replies')
    const replies = (await response.json()) as SettingsSavedReply[]
    return replies.map(reply => ({
      name: reply.title,
      content: reply.body,
    }))
  } catch {
    return []
  }
}

export function useGetSavedReplies() {
  return useCachedRequest(tryGetSavedReplies)
}
