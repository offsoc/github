import type React from 'react'
import {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react'

type DiffFindOpenContextType = {
  diffFindOpen: boolean
  setDiffFindOpen: (open: boolean) => void
}

const DiffFindOpenContext = createContext<DiffFindOpenContextType>({
  diffFindOpen: false,
  setDiffFindOpen: () => undefined,
})

/**
 * This is equivalent to a simple setState, except we save the search state of the find in file panel when it's closed
 * so we can reopen with the last used value
 */
export function DiffFindOpenProvider({
  children,
  searchTerm,
  setSearchTerm,
}: {
  children: React.ReactNode
  searchTerm: string
  setSearchTerm: (term: string) => void
}) {
  const lastSearchTerm = useRef<string>('')
  const [diffFindOpen, setRawDiffFindOpen] = useState<boolean>(false)
  const setDiffFindOpen = useCallback(
    (open: boolean) => {
      if (open && searchTerm === '' && lastSearchTerm.current !== '') {
        setSearchTerm(lastSearchTerm.current)
      } else if (!open && searchTerm !== '') {
        lastSearchTerm.current = searchTerm
        setSearchTerm('')
      }

      setRawDiffFindOpen(open)
    },
    [searchTerm, setSearchTerm],
  )

  const contextValue: DiffFindOpenContextType = useMemo(() => {
    return {
      diffFindOpen,
      setDiffFindOpen,
    }
  }, [diffFindOpen, setDiffFindOpen])

  return <DiffFindOpenContext.Provider value={contextValue}>{children}</DiffFindOpenContext.Provider>
}

export function useDiffFindOpen() {
  return useContext(DiffFindOpenContext)
}
