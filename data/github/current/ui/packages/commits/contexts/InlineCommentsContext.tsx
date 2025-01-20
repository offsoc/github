import type {Thread} from '@github-ui/diff-lines'
import {noop} from '@github-ui/noop'
import type React from 'react'
import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react'

import type {CommitComment} from '../types/commit-types'

type InlineCommentsContextType = {
  comments: CommitComment[]
  addComments: (comments: CommitComment[], path: string, position: string) => void
  findInlineComment: (relayId: string) => CommitComment | undefined
  getCommentCountByPath: (path: string) => number
  getThreadDataByPathAndPosition: (path: string, position: number) => CommentThreadData | undefined
}

export type CommentThreadData = {
  path: string
  position: number
  count: number
  threads?: Array<Pick<Thread, 'id' | 'commentsData' | 'diffSide'>>
}

const InlineCommentsContext = createContext<InlineCommentsContextType>({
  comments: [],
  addComments: noop,
  findInlineComment: () => undefined,
  getCommentCountByPath: () => 0,
  getThreadDataByPathAndPosition: () => undefined,
})

function arrayToMap(array: CommentThreadData[]) {
  return array.reduce((acc, thread) => {
    acc.set(`${thread.path}::${thread.position}`, thread)
    return acc
  }, new Map<string, CommentThreadData>())
}

export function InlineCommentsProvider({
  children,
  initialFiles,
}: React.PropsWithChildren<{initialFiles?: CommentThreadData[]}>) {
  const [comments, setComments] = useState<CommitComment[]>([])
  const [commentThreadData, setCommentThreadData] = useState<CommentThreadData[]>(initialFiles ?? [])
  const [commentThreadDataMap, setCommentThreadDataMap] = useState<Map<string, CommentThreadData>>(
    initialFiles ? arrayToMap(initialFiles) : new Map(),
  )

  useEffect(() => {
    setCommentThreadData(initialFiles ?? [])
    setCommentThreadDataMap(initialFiles ? arrayToMap(initialFiles) : new Map())
  }, [initialFiles])

  const addComments = useCallback(
    (newComments: CommitComment[], path: string, position: string) => {
      const newCommentIds = newComments.map(comment => comment.id)
      const existingComments = comments.filter(comment => !newCommentIds.includes(comment.id))

      const unchangedThreads = commentThreadData.filter(
        thread => thread.path !== path || thread.position !== parseInt(position),
      )

      const threadToAdd: CommentThreadData = {
        path,
        position: parseInt(position),
        count: newComments.length,
        threads: [
          {
            id: `${path}::${position}`,
            diffSide: 'RIGHT',
            commentsData: {
              totalCount: newComments.length,
              comments: newComments.map(comment => {
                return {
                  author: {
                    avatarUrl: comment?.author?.avatarUrl ?? '',
                    login: comment?.author?.login ?? '',
                    url: '',
                  },
                }
              }),
            },
          },
        ],
      }

      setComments([...existingComments, ...newComments])
      setCommentThreadData([...unchangedThreads, threadToAdd])
      setCommentThreadDataMap(arrayToMap([...unchangedThreads, threadToAdd]))
    },
    [commentThreadData, comments],
  )

  const findInlineComment = useCallback(
    (relayId: string) => {
      return comments.find(comment => comment.relayId === relayId)
    },
    [comments],
  )

  const getCommentCountByPath = useCallback(
    (path: string) => {
      let count = 0

      for (const thread of commentThreadData) {
        if (thread.path === path) {
          count += thread.count
        }
      }

      return count
    },
    [commentThreadData],
  )

  const getThreadDataByPathAndPosition = useCallback(
    (path: string, position: number) => {
      return commentThreadDataMap.get(`${path}::${position}`)
    },
    [commentThreadDataMap],
  )

  const inlineComments = useMemo(
    () => ({
      comments,
      addComments,
      findInlineComment,
      getCommentCountByPath,
      getThreadDataByPathAndPosition,
    }),
    [addComments, comments, findInlineComment, getCommentCountByPath, getThreadDataByPathAndPosition],
  )

  return <InlineCommentsContext.Provider value={inlineComments}>{children}</InlineCommentsContext.Provider>
}

export function useInlineComments() {
  const context = useContext(InlineCommentsContext)

  if (!context) {
    throw new Error('useInlineComments must be used within a InlineCommentsProvider')
  }

  return context
}
