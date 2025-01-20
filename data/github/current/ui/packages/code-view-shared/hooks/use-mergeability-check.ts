import {useCurrentRepository} from '@github-ui/current-repository'
import {mergeabilityCheckPath} from '@github-ui/paths'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useEffect, useState} from 'react'

type MergeabilityState = 'clean' | 'dirty' | 'error'

interface MergeabilityCheckProps {
  head: string
  base: string
}

type MergeabilityCheckResult = [MergeabilityState | undefined, boolean, string | undefined]

export function useMergeabilityCheck({head, base}: MergeabilityCheckProps): MergeabilityCheckResult {
  const [data, setData] = useState<MergeabilityState | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const repo = useCurrentRepository()
  const url = mergeabilityCheckPath({repo, head, base})

  useEffect(() => {
    const update = async () => {
      setLoading(true)
      setData(undefined)
      const response = await verifiedFetchJSON(url)

      try {
        if (response.ok) {
          setData((await response.json()).state)
        } else {
          setError(response.statusText)
        }
      } catch (e) {
        // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
        setError(e?.message || e?.toString())
      }
      setLoading(false)
    }
    update()
  }, [url])

  return [data, loading, error]
}
