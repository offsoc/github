import {addDays, subDays} from 'date-fns'

import {SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import {IssueState, type Label, type Milestone, type User} from '../../client/api/common-contracts'
import {
  CommentAuthorAssociation,
  type IssueComment,
  ItemKeyType,
  type Reactions,
  type SidePanelMetadata,
} from '../../client/api/side-panel/contracts'
import {InitialItems} from '../../stories/data-source'
import {mockTasklistBlockHtml} from '../in-memory-database/tracking-block'
import {DefaultClosedSidePanelMetadata, DefaultOpenSidePanelMetadata} from '../memex-items/issues'
import {todayISOString} from './dates'
import {getUser} from './users'

interface CreateMockIssueCommentsParams {
  issueId: number
  repositoryId: number
  reactions: Reactions
  comments: Array<Omit<Partial<IssueComment>, 'id' | 'issueId' | 'repositoryId'>>
}

let id = 0
const date = subDays(new Date(), 500)
export const createMockSidePanelMetadataForIssue = ({
  comments = [],
  reactions,
  issueId,
  repositoryId,
}: CreateMockIssueCommentsParams): SidePanelMetadata => {
  const issue = InitialItems.find(i => i.id === issueId)
  return {
    itemKey: {
      kind: ItemKeyType.ISSUE,
      itemId: issueId,
      repositoryId,
    },
    reactions,
    comments: comments.map(comment => {
      return Object.assign(
        {
          id: id++,
          createdAt: addDays(date, id * 1).toDateString(),
          updatedAt: addDays(date, id * 1).toDateString(),
          description: {
            body: '',
            bodyHtml: '',
          },
          issueId,
          repositoryId,
          user: getUser('tylerdixon'),
          authorAssociation: CommentAuthorAssociation.NONE,
          viewerCanReact: true,
          reactions: {},
          capabilities: ['editDescription', 'react'],
        },
        comment,
      )
    }),
    title: {
      raw: '',
      html: '',
    },
    description: {
      body: mockTasklistBlockHtml,
      bodyHtml: mockTasklistBlockHtml,
    },
    createdAt: todayISOString,
    updatedAt: todayISOString,
    user: getUser('tylerdixon'),
    state: {
      state: IssueState.Open,
    },
    liveUpdateChannel: `side-panel-live-channel-${issueId}-${repositoryId}`,
    capabilities: ['close', 'comment', 'react', 'reopen', 'editDescription', 'editTitle'],
    projectItemId: issue?.id,
    labels:
      (issue?.memexProjectColumnValues.find(v => v.memexProjectColumnId === SystemColumnId.Labels)
        ?.value as Array<Label>) ?? [],
    milestone: issue?.memexProjectColumnValues.find(v => v.memexProjectColumnId === SystemColumnId.Milestone)
      ?.value as Milestone,
    assignees:
      (issue?.memexProjectColumnValues.find(v => v.memexProjectColumnId === SystemColumnId.Assignees)
        ?.value as Array<User>) ?? [],
  }
}

export const createMockSidePanelMetadataForDraftIssue = (projectItemId: number): SidePanelMetadata => {
  return {
    itemKey: {
      kind: ItemKeyType.PROJECT_DRAFT_ISSUE,
      projectItemId,
    },
    title: {
      raw: '',
      html: '',
    },
    description: {
      body: '',
      bodyHtml: '',
    },
    createdAt: todayISOString,
    updatedAt: todayISOString,
    user: getUser('lerebear'),
    state: {
      state: IssueState.Open,
    },
    liveUpdateChannel: `side-panel-live-channel-${projectItemId}`,
    capabilities: ['close', 'comment', 'react', 'reopen', 'editDescription', 'editTitle'],
    projectItemId,
  }
}

export const DefaultIssuesMetadata: Array<SidePanelMetadata> = [
  DefaultOpenSidePanelMetadata,
  DefaultClosedSidePanelMetadata,
]
