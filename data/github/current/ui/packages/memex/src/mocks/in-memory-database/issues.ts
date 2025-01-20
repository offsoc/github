import type {IssueState, IssueStateReason, User} from '../../client/api/common-contracts'
import {
  CommentAuthorAssociation,
  type IssueComment,
  ItemKeyType,
  type ReactionEmotion,
  type SidePanelMetadata,
} from '../../client/api/side-panel/contracts'
import {not_typesafe_nonNullAssertion} from '../../client/helpers/non-null-assertion'
import {getUpdatedReactions} from '../../client/helpers/reactions-helper'
import {
  createMockSidePanelMetadataForDraftIssue,
  createMockSidePanelMetadataForIssue,
} from '../data/side-panel-metadata'
import {getUser} from '../data/users'
import {AllIssueCommentReactions, DefaultIssueCommentReaction} from '../memex-items'
import {renderMarkdown} from '../render-markdown'

export class IssuesCollection {
  #map = new Map<string, SidePanelMetadata>()

  constructor(issues: Array<SidePanelMetadata> = []) {
    for (const issue of issues) {
      if (issue.itemKey.kind === ItemKeyType.ISSUE) {
        this.#map.set(this.getMapKey(issue.itemKey), issue)
      } else if (issue.itemKey.kind === ItemKeyType.PROJECT_DRAFT_ISSUE) {
        this.#map.set(this.getMapKey(issue.itemKey), issue)
      }
    }
  }

  private getMapKey(itemKey: SidePanelMetadata['itemKey']): string {
    if (itemKey.kind === ItemKeyType.ISSUE) {
      return `issue-${itemKey.itemId}`
    } else if (itemKey.kind === ItemKeyType.PROJECT_DRAFT_ISSUE) {
      return `draftissue-${itemKey.projectItemId}`
    }
    return ''
  }

  public getDraftIssue(memexProjectItemId: number): SidePanelMetadata {
    const issue = this.#map.get(`draftissue-${memexProjectItemId}`)

    if (issue) {
      return issue
    }

    const metadata = createMockSidePanelMetadataForDraftIssue(memexProjectItemId)
    this.#map.set(`draftissue-${memexProjectItemId}`, metadata)
    return metadata
  }

  public getIssue(repositoryId: number, issueId: number): SidePanelMetadata {
    let issue
    if (issueId) {
      issue = this.#map.get(`issue-${issueId}`)
    }
    if (issue) {
      return issue
    }
    const metadata = createMockSidePanelMetadataForIssue({
      repositoryId: repositoryId || 1,
      issueId: issueId || 1,
      comments: [
        {
          description: {
            body: `This comment is very mocked, but specifically for issue ${issueId}`,
            bodyHtml: `<p>This comment is very mocked, but specifically for issue ${issueId}</p>`,
          },
        },
        {
          description: {
            body: `These are just mocked comments for issue ${issueId}`,
            bodyHtml: `<p>These are just mocked comments for issue ${issueId}</p>`,
          },
          reactions: DefaultIssueCommentReaction,
          user: getUser('lerebear'),
        },
        {
          description: {
            body: `Just another mock comment for issue ${issueId}`,
            bodyHtml: `<p>Just another mock comment for issue ${issueId}</p>`,
          },
          reactions: AllIssueCommentReactions,
          user: getUser('shiftkey'),
          authorAssociation: CommentAuthorAssociation.COLLABORATOR,
          createdAt: '2022-03-01T00:00:00.000Z',
          updatedAt: '2022-03-02T00:00:00.000Z',
        },
        {
          description: {
            body: `More test comments for ${issueId}`,
            bodyHtml: `<p>More test comments for ${issueId}</p>`,
          },
          reactions: {heart: ['lerebear', 'shiftkey'], tada: ['shiftkey']},
          user: getUser('shiftkey'),
          authorAssociation: CommentAuthorAssociation.CONTRIBUTOR,
        },
        {
          description: {
            body: `This looks good to me`,
            bodyHtml: `<p>This looks good to me</p>`,
          },
          reactions: {rocket: ['lerebear', 'shiftkey'], '-1': ['shiftkey']},
          user: getUser('olivia'),
          authorAssociation: CommentAuthorAssociation.CONTRIBUTOR,
        },
        {
          description: {
            body: `more comments yay for ${issueId}`,
            bodyHtml: `<p>more comments yay for ${issueId}</p>`,
          },
          reactions: AllIssueCommentReactions,
          user: getUser('maxbeizer'),
          authorAssociation: CommentAuthorAssociation.MEMBER,
        },
      ],
      reactions: AllIssueCommentReactions,
    })
    this.#map.set(`issue-${issueId}`, metadata)
    return metadata
  }

  public addIssueComment(repositoryId: number, issueId: number, body: string, user: User): IssueComment {
    const newComment: IssueComment = {
      id: this.#map.size + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      issueId,
      repositoryId,
      viewerCanReact: true,
      description: {
        body,
        bodyHtml: renderMarkdown(body),
      },
      reactions: {},
      user,
      authorAssociation: CommentAuthorAssociation.CONTRIBUTOR,
      capabilities: ['editDescription', 'react'],
    }
    const issue = this.getIssue(repositoryId, issueId)
    issue.comments = issue.comments && [...issue.comments, newComment]
    return newComment
  }

  public editIssueComment(repositoryId: number, issueId: number, commentId: number, body: string): IssueComment {
    const issue = this.getIssue(repositoryId, issueId)
    const comments = issue.comments
    if (!comments) throw new TypeError('Item does not support comments')
    const editedComment = {
      ...not_typesafe_nonNullAssertion(comments.find(comment => comment.id === commentId)),
      body,
      bodyHtml: renderMarkdown(body),
      updatedAt: new Date().toISOString(),
    }
    const newComments = comments.map(comment => {
      if (comment.id === commentId) {
        return editedComment
      }
      return comment
    })
    issue.comments = newComments
    return editedComment
  }

  public reactToSidePanelItem(
    issueId: number,
    repositoryId: number,
    reaction: ReactionEmotion,
    actor: string,
    reacted: boolean,
    commentId?: number,
  ): void {
    const issue = this.getIssue(repositoryId, issueId)
    if (commentId) {
      const commentToUpdate = issue.comments?.find(comment => comment.id === commentId)
      if (!commentToUpdate) return
      commentToUpdate.reactions = getUpdatedReactions(commentToUpdate.reactions, reaction, actor, reacted)
      const newComments = issue.comments?.map(comment => {
        if (comment.id === commentId) {
          return commentToUpdate
        }
        return comment
      })
      issue.comments = newComments
    } else {
      const reactions = issue.reactions
      issue.reactions = reactions && getUpdatedReactions(reactions, reaction, actor, reacted)
    }
  }

  public updateMetadata(
    itemKey: SidePanelMetadata['itemKey'],
    metadata: Partial<Omit<SidePanelMetadata, 'itemKey'>>,
  ): void {
    const existingIssue = this.#map.get(this.getMapKey(itemKey))
    if (!existingIssue) {
      throw new TypeError('Item does not exist')
    }
    this.#map.set(this.getMapKey(itemKey), {...existingIssue, ...metadata})
  }

  public updateSidePanelItemState(
    issueId: number,
    repositoryId: number,
    state: IssueState,
    reason?: IssueStateReason,
  ): void {
    const issue = this.getIssue(repositoryId, issueId)
    issue.state.state = state
    issue.state.stateReason = reason
  }
}
