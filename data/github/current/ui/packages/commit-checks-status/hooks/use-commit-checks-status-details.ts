import type {RepositoryNWO} from '@github-ui/current-repository'
import {commitStatusDetailsPath} from '@github-ui/paths'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

import {useCallback, useState} from 'react'

import type {CombinedStatusResult} from '../index'

export function useCommitChecksStatusDetails(
  oid: string,
  repo: RepositoryNWO,
): [CombinedStatusResult | undefined, () => void] {
  const [details, setDetails] = useState<CombinedStatusResult>()
  const [oidToFetch, setOidToFetch] = useState<string>()

  const fetchDetails = useCallback(async () => {
    if (oidToFetch !== oid) {
      setOidToFetch(oid)
      // Forget previous details because latest commit may have refreshed, or we may be rendering another page
      setDetails(undefined)

      if (oid) {
        const url = commitStatusDetailsPath(repo, oid)
        const response = await verifiedFetchJSON(url)
        setDetails(await response.json())
      }
    }
  }, [oid, oidToFetch, repo])

  return [details, fetchDetails]
}
