import {createContext, useContext, useMemo, useState, type ReactNode, type VFC} from 'react'
import {CommentEditsContextProvider} from '@github-ui/commenting/CommentEditsContext'

type IssueViewerCommentsContextProps = {
  issueCommentHighlightId: string | null
  setIssueCommentHighlightId: (id: string) => void
}

const IssueViewerCommentsContext = createContext<IssueViewerCommentsContextProps | null>(null)

// IssueViewerCommentsContext is providing context for comments editing and highlighting
export const IssueViewerCommentsContextProvider: VFC<{children: ReactNode}> = ({children}) => {
  const [issueCommentHighlightId, setIssueCommentHighlightId] = useState<string>('')

  const highlightCommentsContextValue = useMemo(() => {
    return {
      issueCommentHighlightId,
      setIssueCommentHighlightId,
    }
  }, [issueCommentHighlightId])

  return (
    <CommentEditsContextProvider>
      <IssueViewerCommentsContext.Provider value={highlightCommentsContextValue}>
        {children}
      </IssueViewerCommentsContext.Provider>
    </CommentEditsContextProvider>
  )
}
export const useIssueViewerCommentsContext = () => {
  const context = useContext(IssueViewerCommentsContext)
  if (!context) {
    throw new Error('useIssueViewerCommentsContext must be used within a IssueViewerCommentsContextProvider.')
  }

  return context
}
