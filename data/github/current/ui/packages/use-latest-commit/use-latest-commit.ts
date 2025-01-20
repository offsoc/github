import memoize from '@github/memoize'
import {repositoryTreePath} from '@github-ui/paths'
import type {CommitWithStatus} from '@github-ui/repos-types'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useEffect, useState} from 'react'

async function fetchJSON(url: string): Promise<CommitWithStatus | undefined> {
  const response = await verifiedFetchJSON(url)
  if (response.ok) {
    return await response.json()
  } else {
    return undefined
  }
}

const memoizeCache = new Map()
const memoizeFetchJSON = memoize(fetchJSON, {cache: memoizeCache})

export function resetMemoizeFetchJSON() {
  memoizeCache.clear()
}

/**
 * Retrieve information of latest commit of current blob or ref and path
 * If we have a current blob payload and it has latest commit, it will be returned immediately
 * Otherwise, we will fetch the latest commit from the server with the ref and path
 * Tree commits are always fetched from the server using the ref and path
 *
 * returns an array with latest commit, loading state and error
 * while loading returns [undefined, true, false]
 * if cannot retrieve latest commit, returns [undefined, false, true]
 */
export function useLatestCommit(
  repoOwner: string | undefined,
  repoName: string | undefined,
  commitish: string | undefined,
  path: string | undefined,
): [CommitWithStatus | undefined, boolean, boolean] {
  const [latestCommit, setLatestCommit] = useState<CommitWithStatus>()
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const commitInfoPath =
    repoName && repoOwner && commitish && path
      ? repositoryTreePath({
          repo: {name: repoName, ownerLogin: repoOwner},
          commitish,
          action: 'latest-commit',
          path,
        })
      : null

  // Adding a hook-specific reset call solution to reset memoize cache
  // We accept the cost of resetting the cache once per hook instance, as the cost of resetting the cache is cheap
  // If we implement Relay, it replaces this solution
  useEffect(() => {
    document.addEventListener(SOFT_NAV_STATE.START, resetMemoizeFetchJSON)

    return () => {
      document.removeEventListener(SOFT_NAV_STATE.START, resetMemoizeFetchJSON)
    }
  })

  useEffect(() => {
    let cancelled = false

    const update = async () => {
      if (!commitInfoPath) return

      setError(false)
      setLoading(true)
      setLatestCommit(undefined)
      const commit = await memoizeFetchJSON(commitInfoPath)

      if (cancelled) {
        return
      }

      try {
        if (commit) {
          setLatestCommit(commit)
        } else {
          setError(true)
        }
      } catch (e) {
        setError(true)
      }
      setLoading(false)
    }

    update()

    return function cancel() {
      cancelled = true
    }
  }, [commitInfoPath, commitish])

  return [latestCommit, loading, error]
}
