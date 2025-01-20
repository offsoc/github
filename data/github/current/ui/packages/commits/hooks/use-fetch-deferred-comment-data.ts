import type {Repository} from '@github-ui/current-repository'
import {getInsightsUrl, reportTraceData} from '@github-ui/internal-api-insights'
import {commitCommentDeferredCommentDataPath} from '@github-ui/paths'
import {reactFetchJSON} from '@github-ui/verified-fetch'
import {useEffect, useState} from 'react'

import type {CommentThreadData} from '../contexts/InlineCommentsContext'
import type {CommitComment} from '../types/commit-types'
import type {Commit, FetchRequestState} from '../types/shared'

export type DeferredCommentData = {
  threadMarkers: CommentThreadData[]
  discussionComments: {
    comments: CommitComment[]
    count: number
    canLoadMore: boolean
  }
  subscribed: boolean
}

export function useDeferredCommentData(repo: Repository, commitOid: Commit['oid']) {
  const [deferredData, setDeferredData] = useState<DeferredCommentData | undefined>(undefined)
  const [state, setState] = useState<FetchRequestState>('initial')

  useEffect(() => {
    setDeferredData(undefined)
    setState('loading')

    const fetchDeferredData = async () => {
      const deferredCommentData = await fetchDeferredCommentData({repo, commitOid})

      setDeferredData(deferredCommentData)
      setState('loaded')
    }

    fetchDeferredData()
  }, [commitOid, repo])

  return {
    deferredCommentData: deferredData,
    state,
  }
}

export async function fetchDeferredCommentData({repo, commitOid}: {repo: Repository; commitOid: Commit['oid']}) {
  const response = await reactFetchJSON(
    getInsightsUrl(
      commitCommentDeferredCommentDataPath({
        owner: repo.ownerLogin,
        repo: repo.name,
        commitOid,
      }),
    ),
  )

  if (response.ok) {
    const data: DeferredCommentData = await response.json()
    reportTraceData(data)
    return data
  } else {
    throw new Error('Failed to fetch comment data')
  }
}
