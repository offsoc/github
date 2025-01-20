import {useFilesPageInfo} from '../contexts/FilesPageInfoContext'
import {useCurrentRepository} from '@github-ui/current-repository'
import {fetchAndMergePath} from '@github-ui/paths'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {useCallback} from 'react'

export function useBranchUpdater() {
  const repo = useCurrentRepository()
  const {
    refInfo: {name},
  } = useFilesPageInfo()

  const discardPath = fetchAndMergePath({repo, refName: name, discard: true})
  const updatePath = fetchAndMergePath({repo, refName: name, discard: false})

  const updateBranch = useCallback(() => {
    return verifiedFetch(updatePath, {method: 'POST'})
  }, [updatePath])

  const discardChanges = useCallback(() => {
    return verifiedFetch(discardPath, {method: 'POST'})
  }, [discardPath])

  return {updateBranch, discardChanges}
}
