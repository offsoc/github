import type {PropsWithChildren} from 'react'
import {createContext, useContext, useMemo} from 'react'

import {parseCommitRange} from '../utils/urls'

interface SelectedRefContextData {
  startOid?: string | null
  endOid?: string | null
  isSingleCommit?: boolean
}

export const SelectedRefContext = createContext<SelectedRefContextData>({})

export function SelectedRefContextProvider({
  baseRefOid,
  path,
  children,
}: PropsWithChildren<{baseRefOid?: string; path: string}>) {
  const value = useMemo(() => {
    const pathParts = path.split('/')
    const last = pathParts[pathParts.length - 1]

    let startOid: string | undefined
    let endOid: string | undefined
    let isSingleCommit: boolean | undefined
    if (last) {
      const pathCommitData = parseCommitRange(last)
      if (pathCommitData) {
        isSingleCommit = 'singleCommitOid' in pathCommitData
        startOid = 'startOid' in pathCommitData ? pathCommitData.startOid : baseRefOid
        endOid = 'endOid' in pathCommitData ? pathCommitData.endOid : pathCommitData.singleCommitOid
      }
    }

    return {
      endOid,
      isSingleCommit,
      startOid,
    }
  }, [baseRefOid, path])

  return <SelectedRefContext.Provider value={value}>{children}</SelectedRefContext.Provider>
}

export const useSelectedRefContext = () => useContext(SelectedRefContext)

export function useHasCommitRange() {
  const {endOid, startOid} = useSelectedRefContext()
  return !!endOid || !!startOid
}
