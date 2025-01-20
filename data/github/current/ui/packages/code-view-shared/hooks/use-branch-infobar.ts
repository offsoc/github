import {useFilesPageInfo} from '../contexts/FilesPageInfoContext'
import type {BranchInfoBar} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {repositoryTreePath} from '@github-ui/paths'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useEffect, useState} from 'react'

export function useBranchInfoBar(): [BranchInfoBar | undefined, string | undefined] {
  const [data, setData] = useState<BranchInfoBar>()
  const [error, setError] = useState<string | 'timeout'>()
  const {refInfo, path} = useFilesPageInfo()
  const repo = useCurrentRepository()

  const url = repositoryTreePath({
    repo,
    action: 'branch-infobar',
    commitish: refInfo.name,
    path,
  })

  useEffect(() => {
    const update = async () => {
      setData(undefined)
      const response = await verifiedFetchJSON(url)

      try {
        if (response.ok) {
          setData(await response.json())
        } else {
          setError(response.status === 422 ? 'timeout' : response.statusText)
        }
      } catch (e) {
        // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
        setError(e?.message || e?.toString())
      }
    }
    update()
  }, [url])

  return [data, error]
}
