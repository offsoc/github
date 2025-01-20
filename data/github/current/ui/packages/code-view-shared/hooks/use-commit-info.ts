import {useCodeViewAddBanner} from '../contexts/CodeViewBannersContext'
import {useFilesPageInfo} from '../contexts/FilesPageInfoContext'
import {useCurrentRepository} from '@github-ui/current-repository'
import {repositoryTreePath} from '@github-ui/paths'
import type {Commit} from '@github-ui/repos-types'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useEffect, useState} from 'react'

interface CommitInfoState {
  commitInfo?: Record<string, Commit>
  loading?: boolean
  error?: boolean
}

export function useCommitInfo(): CommitInfoState {
  const {refInfo, path} = useFilesPageInfo()
  const repo = useCurrentRepository()
  const [state, setState] = useState<CommitInfoState>({loading: true})
  const addBanner = useCodeViewAddBanner()

  const commitPath = repositoryTreePath({
    repo,
    action: 'tree-commit-info',
    commitish: refInfo.name,
    path,
  })

  useEffect(() => {
    let cancelled = false
    const update = async () => {
      setState({loading: true})
      const response = await verifiedFetchJSON(commitPath)

      if (cancelled) {
        return
      }

      try {
        if (response.ok) {
          setState({commitInfo: await response.json()})
        } else {
          addBanner({variant: 'warning', message: 'Failed to load latest commit information.'})
          setState({error: true})
        }
      } catch (e) {
        setState({error: true})
      }
    }

    update()

    // This method will be called if commitPath changes, in order to ignore the old result
    return function cancel() {
      cancelled = true
    }
  }, [addBanner, commitPath])

  return state
}
