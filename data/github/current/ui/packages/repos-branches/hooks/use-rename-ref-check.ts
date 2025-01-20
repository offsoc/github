import {debounce} from '@github/mini-throttle'
import {refNameCheckPath} from '@github-ui/paths'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useCallback, useState} from 'react'
import type {Repository} from '@github-ui/current-repository'

export interface CheckResult {
  status: 'invalid' | 'valid' | 'unknown' | null
  normalizedName?: string
  message?: string
}

interface useRenameRefCheckProps {
  repo: Repository
  currentRefName: string
}

type ReturnType = [CheckResult, (newRefName: string) => void]

// A hook to check the validity of a ref name when it changes
export function useRenameRefCheck({repo, currentRefName}: useRenameRefCheckProps): ReturnType {
  const [result, setResult] = useState<CheckResult>({status: null})

  async function fetchCheck(newRefName: string) {
    const data = {value: newRefName}

    try {
      const response = await verifiedFetchJSON(
        refNameCheckPath({owner: repo.ownerLogin, repo: repo.name, refName: currentRefName}),
        {
          method: 'POST',
          body: data,
        },
      )
      const {message, normalized_name: normalizedName} = await response.json()
      if (response.ok) {
        setResult({
          status: 'valid',
          message,
          normalizedName,
        })
      } else {
        setResult({
          status: 'invalid',
          message,
        })
      }
    } catch (err) {
      setResult({status: 'invalid'})
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps -- this lint rule wants an inline function, but debounce seems more natural
  const debouncedFetchCheck = useCallback(debounce(fetchCheck, 300), [])

  const runnerCheck = useCallback(
    (newRefName: string) => {
      if (newRefName) {
        setResult({status: null})
        debouncedFetchCheck(newRefName)
      } else {
        setResult({status: 'unknown'})
      }
    },
    [debouncedFetchCheck],
  )

  return [result, runnerCheck]
}
