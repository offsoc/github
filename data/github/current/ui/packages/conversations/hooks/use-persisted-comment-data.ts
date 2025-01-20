import {jsonSafeStorage} from '@github-ui/safe-storage'
import {useEffect, useMemo} from 'react'

const {getItem, removeItem, setItem} = jsonSafeStorage<PersistedComment | PersistedDiffComment>('localStorage')

type DiffSide = 'LEFT' | 'RIGHT'

const buildKey = (
  parts: {diffSide?: DiffSide; filePath: string; line?: number; subjectId: string},
  fileLevelComment: boolean,
) => {
  const {diffSide, filePath, line, subjectId} = parts
  if (fileLevelComment) {
    return `PullRequest:${subjectId}-File:${filePath}`
  }
  if (line !== undefined && diffSide !== undefined) {
    return `PullRequest:${subjectId}-File:${filePath}-Line:${line}-DiffSide:${diffSide}`
  }

  throw new Error('Cannot build diff line comment cache key for a comment without a line number or diff side')
}

interface MultilineCommentArgs {
  startLine?: number | null
  startSide?: DiffSide | null
}

export interface PersistedDiffComment extends MultilineCommentArgs {
  text?: string
}

interface PersistedCommentArgs extends MultilineCommentArgs {
  text: string
}

/**
 * Hook that returns whether a persisted comment exists as well as a function to remove the persisted comment from storage
 */
function usePersistedCommentDataBase<T>(localStorageKey: string, handlePersistedCommentExists?: (arg: T) => void) {
  let persistedComment = getItem(localStorageKey)

  let hasPersistedComment = !!persistedComment?.text?.trim()

  useEffect(() => {
    if (!hasPersistedComment) return
    handlePersistedCommentExists?.(persistedComment as T)
    // disabling this as hasPersistentComment is the only variable we want to rerun this effect on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPersistedComment])

  const removePersistedCommentFromStorage = () => {
    removeItem(localStorageKey)
    hasPersistedComment = false
    persistedComment = null
  }

  return {
    hasPersistedComment,
    removePersistedCommentFromStorage,
  }
}

export interface PersistedComment {
  text: string
}

/**
 * Hook that returns whether a persisted comment exists
 * and functions to persist and remove pull request comment data from local storage
 *
 */
export function usePersistedCommentData({
  subjectId,
  handlePersistedCommentExists,
}: {
  subjectId: string
  handlePersistedCommentExists?: (comment: PersistedComment) => void
}) {
  const persistedCommentLocalStorageKey = useMemo(() => {
    return `Comment:${subjectId}`
  }, [subjectId])

  const {hasPersistedComment, removePersistedCommentFromStorage} = usePersistedCommentDataBase<PersistedComment>(
    persistedCommentLocalStorageKey,
    handlePersistedCommentExists,
  )

  const persistCommentToStorage = (commentText: string) => {
    setItem(persistedCommentLocalStorageKey, {text: commentText})
  }

  return {
    hasPersistedComment,
    persistCommentToStorage,
    removePersistedCommentFromStorage,
  }
}

/**
 * Hook that returns whether a persisted pull request review comment exists
 * and functions to persist and remove pull request review comment data from local storage
 *
 */
export function usePersistedDiffCommentData({
  diffSide,
  filePath,
  handlePersistedCommentExists,
  line,
  subjectId,
  threadId,
  fileLevelComment,
}: {
  diffSide?: DiffSide
  filePath: string
  line?: number
  subjectId: string
  threadId?: string
  handlePersistedCommentExists?: (comment: PersistedDiffComment) => void
  fileLevelComment: boolean
}) {
  const persistedCommentLocalStorageKey = useMemo(() => {
    if (threadId) return threadId
    return threadId ?? buildKey({diffSide, filePath, line, subjectId}, fileLevelComment)
  }, [diffSide, filePath, line, subjectId, threadId, fileLevelComment])

  const {hasPersistedComment, removePersistedCommentFromStorage} = usePersistedCommentDataBase<PersistedDiffComment>(
    persistedCommentLocalStorageKey,
    handlePersistedCommentExists,
  )

  const persistCommentToStorage = (args: PersistedCommentArgs) => {
    let comment: PersistedCommentArgs = {text: args.text}
    if (args.startLine && args.startSide) {
      comment = {...comment, startLine: args.startLine, startSide: args.startSide}
    }
    setItem(persistedCommentLocalStorageKey, comment)
  }

  return {
    hasPersistedComment,
    persistCommentToStorage,
    removePersistedCommentFromStorage,
  }
}
