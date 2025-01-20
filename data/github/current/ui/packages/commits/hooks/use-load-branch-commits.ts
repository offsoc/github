import {type Repository, useCurrentRepository} from '@github-ui/current-repository'
import {branchCommmitsPath} from '@github-ui/paths'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useEffect, useState} from 'react'

export interface BranchInfo {
  branch: string
  prs: LinkedPullRequest[]
}

interface BranchCommitData {
  branches: BranchInfo[]
  tags: string[]
}

export interface LinkedPullRequest {
  number: number
  showPrefix: string
  repo: Pick<Repository, 'name' | 'ownerLogin'>
  globalRelayId: string
}

export interface BranchCommitState extends BranchCommitData {
  loading: boolean
}

export function useLoadBranchCommits(commitOid: string): BranchCommitState {
  const repo = useCurrentRepository()

  const [state, setState] = useState<BranchCommitState>({branches: [], tags: [], loading: true})

  useEffect(() => {
    let cancelled = false
    const update = async () => {
      setState({branches: [], tags: [], loading: true})
      const response = await verifiedFetchJSON(
        branchCommmitsPath({owner: repo.ownerLogin, repo: repo.name, commitish: commitOid}),
      )

      if (cancelled) {
        return
      }

      try {
        if (response.ok) {
          const data = await response.json()
          data.loading = false
          if (data) {
            setState({...data, loading: false})
          }
        } else {
          setState({branches: [], tags: [], loading: false})
        }
      } catch (e) {
        setState({branches: [], tags: [], loading: false})
      }
    }

    update()

    return function cancel() {
      cancelled = true
    }
  }, [repo.ownerLogin, repo.name, commitOid])

  return state
}
