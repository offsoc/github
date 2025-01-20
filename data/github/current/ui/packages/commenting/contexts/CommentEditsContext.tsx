import {createContext, type ReactNode, useCallback, useContext, useMemo, useState, type VFC} from 'react'

type CommentEditsContextState = {
  // key is a unique identifier for a comment or for the body of the issue or pull
  startCommentEdit: (key: string) => void
  cancelCommentEdit: (key: string) => void
  cancelAllCommentEdits: () => void
  isCommentEditActive: () => boolean
}

const CommentEditsContext = createContext<CommentEditsContextState | null>(null)

type OngoingEditsState = Readonly<Record<string, boolean>>
const defaultEmptyState = {}

export const CommentEditsContextProvider: VFC<{children: ReactNode}> = ({children}) => {
  const [ongoingEditsState, setOngoingEditsState] = useState<OngoingEditsState>(defaultEmptyState)

  const startCommentEdit = useCallback((key: string) => {
    setOngoingEditsState(previousOngoingEditsState => {
      if (previousOngoingEditsState[key]) return previousOngoingEditsState
      return {
        ...previousOngoingEditsState,
        [key]: true,
      }
    })
  }, [])

  const cancelCommentEdit = useCallback((key: string) => {
    setOngoingEditsState(previousOngoingEditsState => {
      if (!previousOngoingEditsState[key]) return previousOngoingEditsState
      return {
        ...previousOngoingEditsState,
        [key]: false,
      }
    })
  }, [])

  const isCommentEditActive = useCallback(() => {
    return Object.values(ongoingEditsState).some(value => value)
  }, [ongoingEditsState])

  const cancelAllCommentEdits = useCallback(() => {
    setOngoingEditsState(defaultEmptyState)
  }, [])

  const editContextValue = useMemo(() => {
    return {
      startCommentEdit,
      cancelCommentEdit,
      isCommentEditActive,
      cancelAllCommentEdits,
    }
  }, [cancelAllCommentEdits, cancelCommentEdit, isCommentEditActive, startCommentEdit])

  return <CommentEditsContext.Provider value={editContextValue}>{children}</CommentEditsContext.Provider>
}

export const useCommentEditsContext = () => {
  const context = useContext(CommentEditsContext)
  if (!context) {
    throw new Error('useCommentEditsContext must be used within a CommentEditsContextProvider.')
  }

  return context
}
