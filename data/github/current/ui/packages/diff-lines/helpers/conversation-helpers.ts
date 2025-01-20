import type {ThreadSummary} from '@github-ui/conversations'
import type {Threads, CommentAuthor} from '../types'

/**
 * Returns essential metadata for showing thread info in places like
 * the thread selection menu from the ActionBar
 * @param threads The Threads object from which to retrieve thread metadata
 * @param ghostUser Universal fallback User, preferred to pass down from app payload
 * @returns An array of objects containing thread metadata, including thread ID, author, and comment count
 */
export function threadSummary(
  threadsData: Threads | undefined | null,
  ghostUser: CommentAuthor | undefined | null,
): ThreadSummary[] {
  const lineThreads =
    threadsData?.threads?.flatMap(thread => {
      const id = thread?.id
      const firstAuthor = thread?.commentsData?.comments?.[0]?.author ?? ghostUser
      const commentCount = thread?.commentsData.totalCount ?? 0
      const commentsConnectionId = thread?.commentsData?.__id
      return id && firstAuthor
        ? [
            {
              id,
              author: firstAuthor,
              commentCount,
              commentsConnectionId,
              diffSide: thread.diffSide,
              isOutdated: thread.isOutdated,
              line: thread.line,
              startLine: thread.startLine,
              startDiffSide: thread.startDiffSide,
            },
          ]
        : []
    }) ?? []

  return lineThreads
}
