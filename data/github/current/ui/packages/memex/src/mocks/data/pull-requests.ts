import {SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import type {PullRequestTitleValue} from '../../client/api/columns/contracts/title'
import {type LinkedPullRequest, PullRequestState} from '../../client/api/common-contracts'
import type {PullRequest} from '../../client/api/memex-items/contracts'
import {ItemType} from '../../client/api/memex-items/item-type'
import {CustomTextColumnId, ImpactColumnId, StageColumnId, TeamColumnId} from './columns'
import {getLabel} from './labels'
import {getMilestoneByRepository} from './milestones'
import {getNextId} from './mock-ids'
import {getRepository} from './repositories'
import {getSingleSelectOptionValueFromName, stageOptions, statusOptions} from './single-select'
import {getTeamById} from './teams-text-column'
import {getUser} from './users'

interface CreateMockPullRequestParam {
  isOpen: boolean
  issueNumber: number
  title: string
  priority: number
  assignees: Array<string>
  status: string
  stage: string
  impact: string
  isDraft?: boolean
  isMerged?: boolean
  repositoryId?: number
  milestoneId?: number
  teamId?: number
  labelIds?: Array<number>
}

export const createMockPullRequest = ({
  isOpen,
  issueNumber,
  title,
  priority,
  assignees,
  status,
  stage,
  impact,
  isDraft = false,
  isMerged = false,
  repositoryId = 2,
  milestoneId = 6,
  teamId = 1,
  labelIds = [22],
}: CreateMockPullRequestParam): PullRequest => {
  const issueAssignees = assignees.map(login => getUser(login))
  const id = getNextId()
  let prState: PullRequestState = isOpen ? PullRequestState.Open : PullRequestState.Closed
  prState = isMerged ? PullRequestState.Merged : prState
  const repository = getRepository(repositoryId)
  const milestone = getMilestoneByRepository(repositoryId, milestoneId)
  const team = getTeamById(teamId)
  const labels = labelIds.map(labelId => getLabel(labelId))
  const statusOption = getSingleSelectOptionValueFromName(status, statusOptions)
  const stageOption = getSingleSelectOptionValueFromName(stage, stageOptions)

  const titleValue: PullRequestTitleValue = {
    number: issueNumber,
    state: prState,
    title: {raw: title, html: title},
    isDraft,
    issueId: 524242,
  }

  return {
    id,
    contentType: ItemType.PullRequest,
    content: {
      id,
      url: `https://github.com/github/memex/issues/${issueNumber}`,
    },
    contentRepositoryId: repository.id,
    priority,
    updatedAt: new Date().toISOString(),
    memexProjectColumnValues: [
      {
        memexProjectColumnId: SystemColumnId.Title,
        value: titleValue,
      },
      {
        memexProjectColumnId: SystemColumnId.Assignees,
        value: issueAssignees,
      },
      {
        memexProjectColumnId: SystemColumnId.Milestone,
        value: milestone,
      },
      {
        memexProjectColumnId: SystemColumnId.Labels,
        value: labels,
      },
      {
        memexProjectColumnId: SystemColumnId.Repository,
        value: {...repository},
      },
      {
        memexProjectColumnId: SystemColumnId.Status,
        value: statusOption,
      },
      {
        memexProjectColumnId: CustomTextColumnId,
        value: {
          raw: 'Really really, really, really, really, really long custom text value',
          html: 'Really really, really, really, really, really long custom text value',
        },
      },
      {
        memexProjectColumnId: StageColumnId,
        value: stageOption,
      },
      {
        memexProjectColumnId: TeamColumnId,
        value: {
          ...team,
        },
      },
      {
        memexProjectColumnId: ImpactColumnId,
        value: {
          raw: impact,
          html: impact,
        },
      },
    ],
  }
}

export const mockLinkedPullRequests: Array<LinkedPullRequest> = [
  {
    id: 123,
    isDraft: false,
    number: 123,
    state: PullRequestState.Merged,
    url: 'https://github.com/github/memex/issues/123',
  },
  {
    id: 456,
    isDraft: false,
    number: 456,
    state: PullRequestState.Open,
    url: 'https://github.com/github/memex/issues/456',
  },
  {
    id: 789,
    isDraft: true,
    number: 789,
    state: PullRequestState.Open,
    url: 'https://github.com/github/memex/issues/789',
  },
  {
    id: 1234,
    isDraft: false,
    number: 1234,
    state: PullRequestState.Closed,
    url: 'https://github.com/github/memex/issues/1234',
  },
]
