import type {CommentAuthorAssociation} from '@github-ui/commenting/IssueCommentHeader.graphql'
import type {Comment, Thread} from '@github-ui/conversations'
import type {Repository} from '@github-ui/current-repository'
import {commitInlineCommentsPath} from '@github-ui/paths'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useCallback} from 'react'

import {useInlineComments} from '../contexts/InlineCommentsContext'
import type {CommitComment} from '../types/commit-types'
import type {Commit} from '../types/shared'
import {shortSha} from '../utils/short-sha'

export function useFetchThread({
  repo,
  commit,
  viewerCanReply,
}: {
  repo: Repository
  commit: Commit
  viewerCanReply: boolean
}) {
  const {addComments} = useInlineComments()

  return useCallback(
    (threadId: string) => {
      return new Promise<Thread | undefined>(async (resolve, reject) => {
        const [path, position] = threadId.split('::')

        if (!path || !position) {
          reject(new Error('Invalid threadId'))
          return
        }

        const response = await verifiedFetchJSON(
          commitInlineCommentsPath({
            owner: repo.ownerLogin,
            repo: repo.name,
            commitOid: commit.oid,
            path,
            position,
          }),
        )

        if (response.ok) {
          const data = await response.json()

          addComments(data.comments, path, position) // sync comments with the context

          const thread = data.comments ? makeThread(data.comments, commit, repo, viewerCanReply, threadId) : undefined
          resolve(thread)
        } else {
          reject(new Error('Failed to fetch thread'))
        }
      })
    },
    [addComments, commit, repo, viewerCanReply],
  )
}

function makeThread(
  commitComments: CommitComment[],
  commit: Commit,
  repo: Repository,
  viewerCanReply: boolean,
  threadId: string,
): Thread {
  const comments: Thread['commentsData']['comments'] = commitComments.map(c => {
    return mapCommitCommentToComment(c, commit, repo)
  })

  const commentData: Thread['commentsData'] = {
    comments,
  }

  return {
    commentsData: commentData,
    id: threadId,
    viewerCanReply,
  }
}

export function mapCommitCommentToComment(comment: CommitComment, commit: Commit, repo: Repository): Comment {
  const commentData: Omit<Comment, ' $fragmentSpreads'> = {
    // TODO - fix these three fields?
    publishedAt: undefined,
    state: '',
    viewerRelationship: '',

    id: comment.relayId,
    databaseId: comment.id,
    body: comment.body,
    bodyHTML: comment.htmlBody,
    createdAt: comment.createdAt,
    url: `${ssrSafeWindow?.location}#${comment.urlFragment}`,
    currentDiffResourcePath: `#${comment.urlFragment}`,
    authorAssociation: comment.authorAssociation?.toUpperCase() as CommentAuthorAssociation,
    author: {
      id: comment.author.id,
      login: comment.author.login,
      avatarUrl: comment.author.avatarUrl,
      url: '',
    },
    isHidden: comment.isHidden,
    lastUserContentEdit: comment.lastUserContentEdit,
    minimizedReason: comment.minimizedReason,
    subjectType: 'commit',
    viewerCanMinimize: comment.viewerCanMinimize,
    viewerCanSeeMinimizeButton: comment.viewerCanMinimize,
    viewerCanSeeUnminimizeButton: comment.viewerCanMinimize,
    viewerCanDelete: comment.viewerCanDelete,
    viewerCanUpdate: comment.viewerCanUpdate,
    viewerCanReport: comment.viewerCanReport,
    viewerCanReportToMaintainer: comment.viewerCanReportToMaintainer,
    viewerCanBlockFromOrg: comment.viewerCanBlockFromOrg,
    viewerCanUnblockFromOrg: comment.viewerCanUnblockFromOrg,
    viewerDidAuthor: comment.viewerDidAuthor,
    reference: {
      number: undefined,
      text: shortSha(commit.oid),
      author: {
        login: commit.authors.length > 0 ? commit.authors[0]?.login ?? '' : '',
      },
    },
    repository: {
      id: repo.id.toString(),
      isPrivate: repo.private,
      name: repo.name,
      owner: {
        id: repo.ownerLogin,
        login: repo.ownerLogin,
        url: '',
      },
    },
  }

  return commentData as Comment
}
