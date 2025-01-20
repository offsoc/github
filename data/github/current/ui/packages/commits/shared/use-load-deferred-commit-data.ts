import {getInsightsUrl, reportTraceData} from '@github-ui/internal-api-insights'
import {reactFetchJSON} from '@github-ui/verified-fetch'
import {useEffect, useRef, useState} from 'react'

import {baseEmptyStateLoading, baseEmptyStateNotLoading} from '../contexts/DeferredCommitDataContext'
import type {DeferredCommitData, DeferredData} from '../types/commits-types'

export function useLoadDeferredCommitData(url: string, updatedAt?: number): DeferredData {
  const [state, setState] = useState<DeferredData>(baseEmptyStateLoading)

  useEffect(() => {
    if (!url) return

    let cancelled = false
    const update = async () => {
      setState(baseEmptyStateLoading)
      const response = await reactFetchJSON(getInsightsUrl(url))

      if (cancelled) {
        return
      }

      try {
        if (response.ok) {
          const data = await response.json()
          data.loading = false
          if (data) {
            reportTraceData(data)
            setState(data)
          }
        } else {
          setState(baseEmptyStateNotLoading)
        }
      } catch (e) {
        setState(baseEmptyStateNotLoading)
      }
    }

    update()

    return function cancel() {
      cancelled = true
    }
  }, [url, updatedAt])

  return state
}

export function useLoadSingleDeferredCommitData(url: string): DeferredCommitData | null {
  const [state, setState] = useState<DeferredCommitData | null>(null)

  useEffect(() => {
    if (!url) return

    const update = async () => {
      const response = await reactFetchJSON(getInsightsUrl(url))

      try {
        if (response.ok) {
          const data = await response.json()
          if (data) {
            reportTraceData(data)
            setState(data.data)
          }
        }
      } catch (e) {
        //noop
      }
    }

    update()
  }, [url])

  return state
}

export function useLoadDeferredCommitDataPaginated(
  url: string,
  startIndex: number,
  commitCount: number,
  dataUpdatedAt?: number,
): DeferredData {
  const [state, setState] = useState<DeferredData>(baseEmptyStateLoading)
  const cumulativeDeferredCommitInfo = useRef([...new Array(commitCount)] as Array<DeferredCommitData | undefined>)
  const previousStartingIndex = useRef(startIndex)

  useEffect(() => {
    if (!url) return

    let cancelled = false
    async function update(startingIndex: number) {
      const response = await reactFetchJSON(`${url}?start_entry=${startingIndex}`)

      if (cancelled) {
        return
      }

      try {
        if (response.ok) {
          const data = await response.json()
          if (data) {
            let index = 0
            for (let i = previousStartingIndex.current; i < data.nextIndex; i++) {
              cumulativeDeferredCommitInfo.current[i] = data.deferredCommits[index]
              index++
            }
            data.deferredCommits = cumulativeDeferredCommitInfo.current
            if (data.loadMore && previousStartingIndex.current !== data.nextIndex) {
              previousStartingIndex.current = data.nextIndex
              setState(data)
              setTimeout(
                //doing a 0ms timeout allows the state updates to flush, giving the user the parts of the diff
                //as we get them rather than waiting until they're fully loaded
                () => update(data.nextIndex),
                0,
              )
            } else if (previousStartingIndex.current === data.nextIndex) {
              data.error = true
              setState(data)
            } else {
              data.error = false
              setState(data)
            }
          }
        } else {
          setState(oldState => ({
            ...oldState,
            loading: false,
            error: true,
            extraDiffEntries: cumulativeDeferredCommitInfo.current,
          }))
        }
      } catch (e) {
        //do this to keep any commit info we  have already received rather than wiping it out
        setState(oldState => ({
          ...oldState,
          loading: false,
          deferredCommits: cumulativeDeferredCommitInfo.current,
        }))
      }
    }

    update(startIndex)

    return function cancel() {
      cancelled = true
    }
  }, [url, dataUpdatedAt, startIndex])

  //if we soft nav to a new diff, reset the cumulative
  useEffect(() => {
    cumulativeDeferredCommitInfo.current = []
    previousStartingIndex.current = startIndex
  }, [url, dataUpdatedAt, startIndex])

  return state
}
