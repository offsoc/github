import type {Repository} from '@github-ui/current-repository'
import {repositoryPath} from '@github-ui/paths'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useEffect, useState} from 'react'
import {useSearchParams} from '@github-ui/use-navigate'
import type {BranchMetadata} from '../types'

export default function useDeferredMetadata(
  repository: Repository,
  branchNames: string[],
): Map<string, BranchMetadata> | undefined {
  const [metadataMap, setMetadataMap] = useState<Map<string, BranchMetadata> | undefined>(undefined)

  const [searchParams] = useSearchParams()
  const query = searchParams.get('query') ?? ''

  const postParams = new URLSearchParams()
  if (query.length > 0) {
    postParams.append('include_authors', 'true')
  }

  const metadataUrl = `${repositoryPath({
    owner: repository.ownerLogin,
    repo: repository.name,
    action: 'branches',
  })}/deferred_metadata?${postParams.toString()}`

  useEffect(() => {
    let cancelled = false

    const update = async () => {
      setMetadataMap(undefined)

      if (!branchNames.length) {
        setMetadataMap(new Map())
        return
      }

      const response = await verifiedFetchJSON(metadataUrl, {body: {branches: branchNames}, method: 'POST'})

      if (cancelled) {
        return
      }

      try {
        if (response.ok) {
          const data = (await response.json()) as {deferredMetadata: Map<string, BranchMetadata>}

          if (data) {
            setMetadataMap(new Map(Object.entries(data.deferredMetadata)))
          }
        } else {
          setMetadataMap(new Map())
        }
      } catch (e) {
        setMetadataMap(new Map())
      }
    }

    update()

    return function cancel() {
      cancelled = true
    }
  }, [branchNames, metadataUrl])

  return metadataMap
}
