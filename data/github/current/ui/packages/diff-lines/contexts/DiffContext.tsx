import type {
  CommentingImplementation,
  Subject,
  MarkerNavigationImplementation,
  ViewerData,
} from '@github-ui/conversations'
import {VALUES} from '../constants'
import type {PropsWithChildren} from 'react'
import {createContext, useContext, useMemo} from 'react'
import type {CommentAuthor} from '../types'

export type Range = {
  start: number
  end: number
}

export type DiffContextData = {
  /**
   * Callback that should add the specified range of lines to the diff
   */
  addInjectedContextLines: (range: Range) => void
  /**
   * True if comment batching is enabled and a batch is currently active
   */
  commentBatchPending: boolean
  /**
   * True if commenting is enabled for the current diff; requires that a commenting implementation be passed as well.
   */
  commentingEnabled: boolean
  /**
   * Optional commenting backend implementation to use for the current diff.
   */
  commentingImplementation?: CommentingImplementation
  /**
   * Optional thread navigation (used for pull request typically)
   */
  markerNavigationImplementation?: MarkerNavigationImplementation
  /**
   * Id of the repository containing the diff
   */
  repositoryId: string
  /**
   * Id of the subject of the diff (e.g. a pull request id)
   */
  subjectId: string
  /**
   * Subject metadata (e.g. pull request data that @github-ui/conversations package, lower in hierarchy, requires)
   */
  subject: Subject
  /**
   * Old/start commit oid for the pull request comparison for the current diff
   */
  oldCommitOid?: string
  /**
   * New/end commit oid for the pull request comparison for the current diff
   */
  newCommitOid?: string
  /**
   * Information about the current user required for rendering diffs.
   */
  viewerData: ViewerData
  /**
   * Default Fallback User if GraphQL author is null or undefined.
   * Optional because fallback relies on hardcoded constants
   * Preferred for Apps to pass in value from App Payload
   */
  ghostUser?: CommentAuthor
}

const DiffContext = createContext<DiffContextData | null>(null)

export function DiffContextProvider({children, ...props}: PropsWithChildren<DiffContextData>) {
  const hasCommentingImplementation = !!props.commentingImplementation
  const hasMarkerNavigationImplementation = !!props.markerNavigationImplementation
  if (
    props.commentingEnabled !== hasCommentingImplementation &&
    props.commentingEnabled !== hasMarkerNavigationImplementation
  ) {
    throw new Error(
      'commentingEnabled, commentingImplementation, and markerNavigationImplementation must be passed together',
    )
  }
  const ghost = props?.ghostUser ?? VALUES.ghostUser

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const contextData = useMemo(() => ({ghostUser: ghost, ...props}), [...Object.values(props), ghost])

  return <DiffContext.Provider value={contextData}>{children}</DiffContext.Provider>
}

export function useDiffContext(): DiffContextData {
  const contextData = useContext(DiffContext)
  if (!contextData) {
    throw new Error('useDiffContext must be used within a DiffContextProvider')
  }

  return contextData
}
