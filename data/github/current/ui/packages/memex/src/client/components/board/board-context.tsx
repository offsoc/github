import {createContext, memo, type PropsWithChildren, useContext} from 'react'
import invariant from 'tiny-invariant'

import {useBoardItems} from './hooks/use-board-items'

export const BoardContext = createContext<ReturnType<typeof useBoardItems> | null>(null)

export const BoardContextProvider = memo<PropsWithChildren>(function BoardContextProvider({children}) {
  return <BoardContext.Provider value={useBoardItems()}>{children}</BoardContext.Provider>
})

export const useBoardContext = () => {
  const context = useNullableBoardContext()
  invariant(context != null)
  return context
}
export const useNullableBoardContext = () => {
  const context = useContext(BoardContext)
  return context
}
