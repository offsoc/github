import {createContext, useContext, useMemo, useState} from 'react'

interface FileQueryContextType {
  query: string
  setQuery: (query: string) => void
}

export const FileQueryContext = createContext<FileQueryContextType>({query: '', setQuery: () => undefined})

export function useFileQueryContext() {
  return useContext(FileQueryContext)
}

export function FileQueryProvider({children}: {children: React.ReactNode}) {
  const [query, setQuery] = useState('')
  const value = useMemo(() => ({query, setQuery}), [setQuery, query])

  return <FileQueryContext.Provider value={value}>{children}</FileQueryContext.Provider>
}
