import type {Dispatch, SetStateAction} from 'react'
import {createContext, useContext, useMemo, useState} from 'react'

type ActivePagesType = {
  pages: Array<number>
  setPages: Dispatch<SetStateAction<Array<number>>>
}

const ActivePagesContext = createContext<ActivePagesType | null>(null)

/**
 * A context provider to track state pages in the visible table.
 */
export const ActivePagesProvider: React.FC<{children: React.ReactNode}> = props => {
  const [pages, setPages] = useState<Array<number>>([])

  const value = useMemo(
    () => ({
      pages,
      setPages,
    }),
    [pages, setPages],
  )

  return <ActivePagesContext.Provider value={value}>{props.children}</ActivePagesContext.Provider>
}

export const useActivePages = (): ActivePagesType => {
  const contextValue = useContext(ActivePagesContext)
  if (!contextValue) {
    throw Error(`useActivePages can only be accessed from a ActivePagesProvider component`)
  }

  return contextValue
}
