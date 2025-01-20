import {renameBranchEffectsPath} from '@github-ui/paths'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useEffect, useState} from 'react'
import type {Repository} from '@github-ui/current-repository'
import type {RenameBranchEffects} from '../types'

export default function useRenameBranchEffects({
  repo,
  branchName,
}: {
  repo: Repository
  branchName: string
}): RenameBranchEffects | undefined {
  const [renameEffects, setRenameEffects] = useState<RenameBranchEffects | undefined>(undefined)

  useEffect(() => {
    const effectsUrl = renameBranchEffectsPath({owner: repo.ownerLogin, repo: repo.name, branchName})
    const emptyEffects: RenameBranchEffects = {
      prRetargetCount: 0,
      prRetargetRepoCount: 0,
      prClosureCount: 0,
      draftReleaseCount: 0,
      protectedBranchCount: 0,
      willPagesChange: false,
    }
    async function fetchEffects() {
      setRenameEffects(undefined)
      try {
        const response = await verifiedFetchJSON(effectsUrl, {method: 'GET'})
        if (response.ok) {
          const data = await response.json()
          if (data) {
            setRenameEffects(data)
          } else {
            setRenameEffects(emptyEffects)
          }
        } else {
          setRenameEffects(emptyEffects)
        }
      } catch {
        setRenameEffects(emptyEffects)
      }
    }
    fetchEffects()
  }, [branchName, repo.ownerLogin, repo.name])

  return renameEffects
}
