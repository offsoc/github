import {useCurrentRepository} from '@github-ui/current-repository'
import {encodePart} from '@github-ui/paths'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {useConfirm} from '@primer/react'
import {useCallback, useMemo} from 'react'

import type {CommitComment, CommitPayload} from '../types/commit-types'

export type Result = {
  error: Error | null
  comment: CommitComment | null
}

export type EditResult = {
  error: Error | null
  updatedFields: Pick<CommitComment, 'body' | 'bodyVersion' | 'htmlBody'> | null
}

export type DeleteResult = 'success' | 'error' | 'canceled'
export type HideResult = 'success' | 'error'

type UpdateCommentResponse = {
  source: string
  bodyVersion: string
  body: SafeHTMLString
}

export function useCommenting() {
  const repo = useCurrentRepository()
  const confirm = useConfirm()
  const payload = useRoutePayload<CommitPayload>()
  const {commit} = payload
  const baseUrl = `/${encodePart(repo.ownerLogin)}/${encodePart(repo.name)}/commit_comment`
  const createUrl = `${baseUrl}/create`

  const addComment = useCallback(
    async (markdown: string, path?: string, position?: string): Promise<Result> => {
      const formData = new FormData()

      formData.append('commit_id', commit.oid)
      formData.append('comment[body]', markdown)

      if (path && position) {
        formData.append('path', path)
        formData.append('position', position.toString())
      }

      const response = await verifiedFetch(createUrl, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const comment: CommitComment = (await response.json()).comment

        return {
          error: null,
          comment,
        }
      } else {
        return {
          error: new Error('Failed to add comment'),
          comment: null,
        }
      }
    },
    [commit.oid, createUrl],
  )

  const editComment = useCallback(
    async (markdown: string, comment: Pick<CommitComment, 'id' | 'bodyVersion'>): Promise<EditResult> => {
      const formData = new FormData()

      formData.append('_method', 'put')
      formData.append('commit_comment[id]', comment.id.toString())
      formData.append('commit_comment[body]', markdown)
      formData.append('commit_comment[bodyVersion]', comment.bodyVersion)

      const response = await verifiedFetch(baseUrl, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const json: UpdateCommentResponse = await response.json()

        return {
          error: null,
          updatedFields: {
            body: json.source,
            bodyVersion: json.bodyVersion,
            htmlBody: json.body,
          },
        }
      } else {
        return {
          error: new Error('Failed to edit comment'),
          updatedFields: null,
        }
      }
    },
    [baseUrl],
  )

  const deleteComment = useCallback(
    async (commentId: string): Promise<DeleteResult> => {
      const deleteConfirmed = await confirm({
        content: 'Are you sure you want to delete this comment?',
        title: 'Delete comment',
        confirmButtonContent: 'Delete',
        confirmButtonType: 'danger',
      })

      if (!deleteConfirmed) {
        return 'canceled'
      }

      const formData = new FormData()

      formData.append('_method', 'delete')
      formData.append('commit_comment[id]', commentId)

      const response = await verifiedFetch(baseUrl, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        return 'success'
      } else {
        return 'error'
      }
    },
    [baseUrl, confirm],
  )

  const hideComment = useCallback(
    async (commentId: string, reason: string): Promise<HideResult> => {
      const formData = new FormData()
      formData.append('_method', 'put')
      formData.append('classifier', reason)

      const response = await verifiedFetch(`${baseUrl}/${commentId}/minimize`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      })

      if (response.ok) {
        return 'success'
      } else {
        return 'error'
      }
    },
    [baseUrl],
  )

  const unhideComment = useCallback(
    async (commentId: string): Promise<HideResult> => {
      const formData = new FormData()
      formData.append('_method', 'put')

      const response = await verifiedFetch(`${baseUrl}/${commentId}/unminimize`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      })

      if (response.ok) {
        return 'success'
      } else {
        return 'error'
      }
    },
    [baseUrl],
  )

  return useMemo(() => {
    return {
      addComment,
      editComment,
      deleteComment,
      hideComment,
      unhideComment,
    }
  }, [addComment, deleteComment, editComment, hideComment, unhideComment])
}
