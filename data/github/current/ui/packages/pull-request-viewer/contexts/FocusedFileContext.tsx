import {parseDiffHash, parseLineRangeHash} from '@github-ui/diff-lines/document-hash-helpers'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import type {PropsWithChildren} from 'react'
import {createContext, useContext, useMemo, useState} from 'react'

interface FocusedDigestData {
  digest?: string
  isNavigationRequest?: boolean
}

interface FocusedFileContextData {
  focusedFileDigest?: FocusedDigestData
  setFocusedFileDigest: (data: FocusedDigestData) => void
}

const FocusedFileContext = createContext<FocusedFileContextData | null>(null)

export function FocusedFileContextProvider({children}: PropsWithChildren) {
  const [focusedFileDigest, setFocusedFileDigest] = useState<FocusedDigestData | undefined>(() => {
    const hash = ssrSafeLocation.hash.substring(1)
    const lineRangeSelectionData = parseLineRangeHash(hash)
    return {digest: lineRangeSelectionData?.diffAnchor ?? parseDiffHash(hash), isNavigationRequest: false}
  })

  return (
    <FocusedFileContext.Provider
      value={useMemo(() => ({focusedFileDigest, setFocusedFileDigest}), [focusedFileDigest])}
    >
      {children}
    </FocusedFileContext.Provider>
  )
}

export function useFocusedFileContext(): FocusedFileContextData {
  const contextData = useContext(FocusedFileContext)
  if (!contextData) {
    throw new Error('useFocusedFileContext must be used within a FocusedFileContextProvider')
  }

  return contextData
}
