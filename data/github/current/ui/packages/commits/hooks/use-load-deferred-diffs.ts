import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useEffect, useRef, useState} from 'react'

import type {DiffEntryDataWithExtraInfo} from '../types/commit-types'

interface ExtraDiffType {
  extraDiffEntries: DiffEntryDataWithExtraInfo[]
  loading: boolean
  error: boolean
}

const baseEmptyStateLoading = {extraDiffEntries: [], loading: true, error: false}

export function useLoadDeferredDiffs(
  byteCount: number,
  lineShownCount: number,
  startIndex: number,
  url: string,
  shouldSendRequest: boolean,
  ignoreWhitespace: boolean,
): ExtraDiffType {
  const [state, setState] = useState<ExtraDiffType>(baseEmptyStateLoading)
  const cumulativeDiffEntries = useRef([] as DiffEntryDataWithExtraInfo[])
  const previousStartingIndex = useRef(startIndex)

  useEffect(() => {
    if (!url || !shouldSendRequest) return

    let cancelled = false
    const update = async (startingIndex: number, bytesCount: number, linesShownCount: number) => {
      setState(baseEmptyStateLoading)
      const response = await verifiedFetchJSON(
        `${url}?start_entry=${startingIndex}&bytes=${bytesCount}&lines=${linesShownCount}`,
      )

      if (cancelled) {
        return
      }

      try {
        if (response.ok) {
          const data = await response.json()
          if (data) {
            data.loading = data.loadMore
            cumulativeDiffEntries.current = cumulativeDiffEntries.current.concat(data.extraDiffEntries)
            data.extraDiffEntries = cumulativeDiffEntries.current
            if (data.loadMore && previousStartingIndex.current !== data.asyncDiffLoadInfo.startIndex) {
              previousStartingIndex.current = data.asyncDiffLoadInfo.startIndex
              setState(data)
              setTimeout(
                //doing a 0ms timeout allows the state updates to flush, giving the user the parts of the diff
                //as we get them rather than waiting until they're fully loaded
                () =>
                  update(
                    data.asyncDiffLoadInfo.startIndex,
                    data.asyncDiffLoadInfo.byteCount,
                    data.asyncDiffLoadInfo.lineShownCount,
                  ),
                0,
              )
            } else if (previousStartingIndex.current === data.asyncDiffLoadInfo.startIndex) {
              data.error = true
              data.loading = false
              setState(data)
            } else {
              //TODO: all state changes are saved for the very end of an effect, but we ideally would
              //progressively be adding diffs as they were loading rather than waiting for them all to load...
              //unsure the best way to handle that
              data.error = false
              data.loading = false
              setState(data)
            }
          }
        } else {
          setState(oldState => ({
            ...oldState,
            loading: false,
            error: true,
            extraDiffEntries: cumulativeDiffEntries.current,
          }))
        }
      } catch (e) {
        //do this to keep any diffs we  have already received rather than wiping them out
        setState(oldState => ({
          ...oldState,
          loading: false,
          error: true,
          extraDiffEntries: cumulativeDiffEntries.current,
        }))
      }
    }

    update(startIndex, byteCount, lineShownCount)

    return function cancel() {
      cancelled = true
    }
  }, [byteCount, lineShownCount, shouldSendRequest, startIndex, url, ignoreWhitespace])

  //if we soft nav to a new diff, reset the cumulative
  useEffect(() => {
    cumulativeDiffEntries.current = []
    previousStartingIndex.current = startIndex
  }, [url, startIndex, ignoreWhitespace])

  return state
}
