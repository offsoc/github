import type {IssueState, IssueStateReason} from '../../client/api/common-contracts'
import {
  type AddCommentRequest,
  CommentAuthorAssociation,
  type EditCommentRequest,
  type IssueComment,
  type IssueKey,
  ItemKeyType,
  type ProjectDraftIssueKey,
  type SidePanelMetadata,
  type UpdateIssueStateRequest,
  type UpdateSidePanelItemData,
  type UpdateSidePanelItemReactionRequest,
} from '../../client/api/side-panel/contracts'
import {not_typesafe_nonNullAssertion} from '../../client/helpers/non-null-assertion'
import {getUpdatedReactions} from '../../client/helpers/reactions-helper'
import {createMemexItemModel} from '../../client/models/memex-item-model'
import {mockLabels} from '../data/labels'
import {getMilestoneByRepository} from '../data/milestones'
import {getUser, mockUsers} from '../data/users'
import {createRequestHandlerWithError} from '../msw-responders'
import {
  get_getSidePanelItem,
  post_addSidePanelComment,
  post_updateSidePanelItem,
  post_updateSidePanelItemReaction,
  post_updateSidePanelItemState,
  put_editSidePanelComment,
} from '../msw-responders/side-panel'
import {renderMarkdown} from '../render-markdown'
import {BaseController} from './base-controller'

export class SidePanelController extends BaseController {
  #latestIssue = null as SidePanelMetadata | null

  public override handlers = [
    get_getSidePanelItem(async (_body, req) => {
      await this.server.sleep()
      const url = new URL(req.url)
      const kind = url.searchParams.get('kind') ?? ''
      switch (kind) {
        case ItemKeyType.PROJECT_DRAFT_ISSUE: {
          const projectItemId = parseInt(url.searchParams.get('project_item_id') ?? '0')
          const issue = this.db.issues.getDraftIssue(projectItemId)
          this.#latestIssue = issue

          if (!issue) {
            throw new Error(`Unable to find issue`)
          }

          return this.applyTitleDefault(projectItemId, issue)
        }
        case ItemKeyType.ISSUE: {
          const itemId = parseInt(url.searchParams.get('item_id') ?? '0')
          const repoId = parseInt(url.searchParams.get('repository_id') ?? '0')
          const issue = this.db.issues.getIssue(repoId, itemId)
          this.#latestIssue = issue

          if (!issue) {
            throw new Error(`Unable to find issue`)
          }

          return this.applyTitleDefault(itemId, issue)
        }
      }
      throw new Error(`Invalid side panelitem type  ${kind}`)
    }),

    post_updateSidePanelItem(async (_body, req) => {
      const requestKey = this.formDecodeToObject<IssueKey | ProjectDraftIssueKey>(await req.clone().text())
      const requestUpdateData = this.formDecodeToObject<UpdateSidePanelItemData>(await req.clone().text())

      let metadata
      switch (requestKey.kind) {
        case ItemKeyType.PROJECT_DRAFT_ISSUE: {
          metadata = this.db.issues.getDraftIssue(parseInt(requestKey.projectItemId))
          break
        }
        case ItemKeyType.ISSUE: {
          metadata = this.db.issues.getIssue(parseInt(requestKey.repositoryId), parseInt(requestKey.itemId))
          break
        }
      }

      if (!metadata) {
        throw new Error(`Unable to find issue metadata`)
      }

      const {update} = requestUpdateData
      if (!update) {
        throw new Error('No update data provided')
      }

      if (update.title) {
        const {title} = update
        metadata.title = {
          raw: title,
          html: title,
        }
      }

      if (update.body) {
        const {body} = update
        metadata.description = {
          body,
          bodyHtml: renderMarkdown(body),
        }
      }

      if (update.assignees && Array.isArray(update.assignees)) {
        metadata.assignees = update.assignees.map(id =>
          not_typesafe_nonNullAssertion(mockUsers.find(u => `${u.id}` === id)),
        )
      }

      if (update.labels && Array.isArray(update.labels) && metadata.itemKey.kind === ItemKeyType.ISSUE) {
        metadata.labels = update.labels.map(id => not_typesafe_nonNullAssertion(mockLabels.find(l => `${l.id}` === id)))
      }

      if (update.milestone && metadata.itemKey.kind === ItemKeyType.ISSUE) {
        metadata.milestone = getMilestoneByRepository(metadata.itemKey.repositoryId, parseInt(update.milestone))
      }

      this.db.issues.updateMetadata(metadata.itemKey, metadata)

      return metadata
    }),
    post_addSidePanelComment(async (_body, req) => {
      const body = this.formDecodeToObject<AddCommentRequest>(await req.text())
      return this.addComment({
        kind: ItemKeyType.ISSUE,
        itemId: parseInt(body.itemId),
        repositoryId: parseInt(body.repositoryId),
        comment: body.comment,
        updateState: body?.updateState as IssueState,
        stateReason: body?.stateReason as IssueStateReason,
      })
    }),
    put_editSidePanelComment(async (_body, req) => {
      const body = this.formDecodeToObject<EditCommentRequest>(await req.text())
      return this.editComment({
        kind: body.kind,
        itemId: parseInt(body.itemId),
        repositoryId: parseInt(body.repositoryId),
        commentId: parseInt(body.commentId),
        body: body.body,
      })
    }),
    post_updateSidePanelItemReaction(async (_body, req) => {
      const body = this.formDecodeToObject<UpdateSidePanelItemReactionRequest>(await req.text())
      return this.updateSidePanelItemReaction({
        itemId: parseInt(body.itemId),
        repositoryId: parseInt(body.repositoryId),
        commentId: body.commentId ? parseInt(body.commentId) : undefined,
        reaction: body.reaction,
        actor: body.actor,
        command: body.command,
        kind: body.kind,
      })
    }),
    post_updateSidePanelItemState(async (_body, req) => {
      const body = this.formDecodeToObject<UpdateIssueStateRequest>(await req.text())
      await this.updateSidePanelItemState({
        itemId: parseInt(body.itemId),
        repositoryId: parseInt(body.repositoryId),
        state: body.state,
        kind: body.kind,
        stateReason: body.stateReason as IssueStateReason,
      })
    }),
  ]

  public override errorHandlers = [
    createRequestHandlerWithError(
      'get',
      'memex-get-sidepanel-item-api-data',
      {
        code: 'Forbidden',
        errors: ['User does not have permission to view this issue'],
      },
      403,
    ),

    createRequestHandlerWithError(
      'post',
      'memex-update-sidepanel-item-api-data',
      {
        code: 'Forbidden',
        errors: ['User does not have permission to update this issue'],
      },
      403,
    ),
    createRequestHandlerWithError(
      'put',
      'memex-comment-on-sidepanel-item-api-data',
      {
        code: 'Forbidden',
        errors: ['User does not have permission to edit comments'],
      },
      403,
    ),
    createRequestHandlerWithError(
      'post',
      'memex-edit-sidepanel-comment-api-data',
      {
        code: 'Forbidden',
        errors: ['User does not have permission to add comments'],
      },
      403,
    ),
    createRequestHandlerWithError(
      'post',
      'memex-update-sidepanel-item-reaction-api-data',
      {
        code: 'Forbidden',
        errors: ['User does not have permission to react to this issue'],
      },
      403,
    ),
    createRequestHandlerWithError(
      'post',
      'memex-update-sidepanel-item-state-api-data',
      {
        code: 'Forbidden',
        errors: ['User does not have permission to view this issue'],
      },
      403,
    ),
  ]

  async addComment(request: AddCommentRequest): Promise<IssueComment> {
    const newComment: IssueComment = {
      id: (this.db.issues.getIssue(request.repositoryId, request.itemId).comments?.length ?? 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: {
        body: request.comment,
        bodyHtml: renderMarkdown(request.comment),
      },
      issueId: request.itemId,
      repositoryId: request.repositoryId,
      user: getUser('shiftkey'),
      authorAssociation: CommentAuthorAssociation.CONTRIBUTOR,
      viewerCanReact: true,
      reactions: {},
      capabilities: ['editDescription', 'react'],
    }
    const allCommments = this.db.issues.getIssue(request.repositoryId, request.itemId).comments ?? []
    this.db.issues.getIssue(request.repositoryId, request.itemId).comments = [...allCommments, newComment]
    if (request.updateState) {
      this.db.issues.getIssue(request.repositoryId, request.itemId).state.state = request.updateState
      this.db.issues.getIssue(request.repositoryId, request.itemId).state.stateReason = request?.stateReason
    }
    await this.server.sleep()
    return newComment
  }

  async editComment(request: EditCommentRequest): Promise<IssueComment> {
    const allCommments = this.db.issues.getIssue(request.repositoryId, request.itemId).comments
    const editedComments =
      allCommments?.map(comment => {
        if (comment.id === request.commentId) {
          return {
            ...comment,
            description: {
              body: request.body,
              bodyHtml: renderMarkdown(request.body),
            },
            updatedAt: new Date().toISOString(),
          }
        }
        return comment
      }) ?? []
    this.db.issues.getIssue(request.repositoryId, request.itemId).comments = editedComments
    await this.server.sleep()
    return not_typesafe_nonNullAssertion(editedComments.find(comment => comment.id === request.commentId))
  }

  async updateSidePanelItemReaction(request: UpdateSidePanelItemReactionRequest): Promise<void> {
    const reacted = request.command === 'unreact'
    if (request.commentId) {
      const allCommments = not_typesafe_nonNullAssertion(
        this.db.issues.getIssue(request.repositoryId, request.itemId).comments,
      )
      const editedComments = allCommments.map(comment => {
        if (comment.id === request.commentId) {
          return {
            ...comment,
            reactions: getUpdatedReactions(comment.reactions, request.reaction, request.actor, reacted),
          }
        }
        return comment
      })
      this.db.issues.getIssue(request.repositoryId, request.itemId).comments = editedComments
    } else {
      const issueReactions = not_typesafe_nonNullAssertion(
        this.db.issues.getIssue(request.repositoryId, request.itemId).reactions,
      )
      const updatedReactions = getUpdatedReactions(issueReactions, request.reaction, request.actor, reacted)

      this.db.issues.getIssue(request.repositoryId, request.itemId).reactions = updatedReactions
    }
    await this.server.sleep()
  }

  async updateSidePanelItemState(request: UpdateIssueStateRequest): Promise<void> {
    const issue = this.db.issues.getIssue(request.repositoryId, request.itemId)
    issue.state.state = request.state
    issue.state.stateReason = request.stateReason
    await this.server.sleep()
  }

  async _updateLatestSidePanelItem(update: Partial<SidePanelMetadata>) {
    if (!this.#latestIssue) {
      return
    }
    this.db.issues.updateMetadata(this.#latestIssue?.itemKey, update)
  }

  applyTitleDefault(itemId: number, metadata: SidePanelMetadata) {
    const {title} = metadata

    // Try looking up a memex item to supply title
    try {
      const memexItem = this.db.memexItems.byContentId(itemId)
      const memexItemModel = createMemexItemModel(memexItem)

      // ensure Tracks completions are populated correctly as part of the issue
      // payload response
      const completion = memexItemModel.columns.Tracks

      // Non-blank title fields in metadata should be used as-is
      if (title.raw !== '' && title.html !== '') {
        return {...metadata, completion}
      }

      return {
        ...metadata,
        completion,
        title: {
          raw: memexItemModel.getRawTitle(),
          html: memexItemModel.getHtmlTitle(),
        },
      }
    } catch (e) {
      // Not finding a memex item throws an exception, which means there's no title to be applied
      if (!(e instanceof Error && e.message === 'Memex item not found')) {
        throw e
      }
    }

    // Attempt to fake a non-memex hierarchy item title
    const fakeHierarchyItemTitle = `Issue title ${itemId}`
    return {
      ...metadata,
      title: {
        raw: fakeHierarchyItemTitle,
        html: fakeHierarchyItemTitle,
      },
    }
  }
}
