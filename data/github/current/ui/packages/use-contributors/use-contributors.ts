import {repositoryTreePath} from '@github-ui/paths'
import type {ContributorsInfo} from '@github-ui/repos-types'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useEffect, useState} from 'react'

interface ContributorsState {
  contributors?: ContributorsInfo
  loading?: boolean
  error?: boolean
}

/**
 * Retrieve information of contributors of current path
 *
 * returns an object with contributors, loading state and error
 * while loading returns {loading: true}
 * if cannot retrieve contributor , returns {error: true}
 */
export function useContributors(
  repoOwner: string | undefined,
  repoName: string | undefined,
  commitish: string | undefined,
  path: string | undefined,
): ContributorsState {
  const [state, setState] = useState<ContributorsState>({loading: true})

  const fileContributorsPath =
    repoName && repoOwner && commitish && path
      ? repositoryTreePath({
          repo: {name: repoName, ownerLogin: repoOwner},
          commitish,
          action: 'file-contributors',
          path,
        })
      : null

  useEffect(() => {
    if (!fileContributorsPath) return

    let cancelled = false
    const update = async () => {
      setState({loading: true})
      const response = await verifiedFetchJSON(fileContributorsPath)

      if (cancelled) {
        return
      }

      try {
        if (response.ok) {
          setState({contributors: await response.json()})
        } else {
          setState({error: true})
        }
      } catch (e) {
        setState({error: true})
      }
    }

    update()

    // This method will be called if fileContributorsPath changes, in order to ignore the old result
    return function cancel() {
      cancelled = true
    }
  }, [fileContributorsPath])

  return state
}
