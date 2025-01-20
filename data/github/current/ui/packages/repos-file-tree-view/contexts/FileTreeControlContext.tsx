import {
  createContext,
  type MutableRefObject,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react'

type FileTreeControlContextType = {
  expandAllFolders?: MutableRefObject<boolean>
  refreshTree?: MutableRefObject<boolean>
  shouldFetchFolders?: MutableRefObject<boolean>
  setExpandAllFolders?: (value: boolean) => void
  setRefreshTree?: (value: boolean) => void
  setShouldFetchFolders?: (value: boolean) => void
}

const FileTreeControlContext = createContext<FileTreeControlContextType>({})

export function FileTreeControlProvider({children}: PropsWithChildren) {
  const expandAllFolders = useRef(false)
  const refreshTree = useRef(false)
  const shouldFetchFolders = useRef(true)
  const setExpandAllFolders = useCallback((value: boolean) => {
    expandAllFolders.current = value
  }, [])

  const setRefreshTree = useCallback((value: boolean) => {
    refreshTree.current = value
  }, [])

  const setShouldFetchFolders = useCallback((value: boolean) => {
    shouldFetchFolders.current = value
  }, [])

  const value = useMemo(
    () => ({
      expandAllFolders,
      refreshTree,
      shouldFetchFolders,
      setExpandAllFolders,
      setRefreshTree,
      setShouldFetchFolders,
    }),
    [setExpandAllFolders, setRefreshTree, setShouldFetchFolders],
  )
  return <FileTreeControlContext.Provider value={value}>{children}</FileTreeControlContext.Provider>
}

export function useFileTreeControlContext() {
  return useContext(FileTreeControlContext)
}
