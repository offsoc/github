import {useCurrentRepository} from '@github-ui/current-repository'
import type {FileRendererBlobData} from '@github-ui/file-renderer-blob'
import {commitPath} from '@github-ui/paths'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useCallback, useEffect, useState} from 'react'

export interface RichDiffData {
  proseDiffHtml?: SafeHTMLString
  fileRendererInfo?: FileRendererBlobData
}

export function useLoadRichDiffData(
  commitOid: string,
  initialState: RichDiffData,
  path: string,
  dependencyDiffPath?: string,
) {
  const initiallyLoaded = !!initialState.proseDiffHtml || !!initialState.fileRendererInfo || !!dependencyDiffPath

  const repo = useCurrentRepository()
  const [loaded, setLoaded] = useState<boolean>(initiallyLoaded)
  const [richDiffData, setRichDiffData] = useState<RichDiffData>(initialState)

  const loadDiffData = useCallback(async () => {
    const response = await verifiedFetchJSON(
      `${commitPath({owner: repo.ownerLogin, repo: repo.name, commitish: commitOid})}/rich_diff/${encodeURIComponent(
        path,
      )}`,
    )

    if (response.ok) {
      const data: RichDiffData = await response.json()
      setRichDiffData(data)
    }

    setLoaded(true)
  }, [commitOid, path, repo])

  useEffect(() => {
    if (!initiallyLoaded) {
      loadDiffData()
    }
  }, [initiallyLoaded, loadDiffData])

  return {loaded, richDiffData}
}
