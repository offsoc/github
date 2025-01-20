import {SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import type {EnrichedText} from '../../client/api/columns/contracts/text'
import type {DraftIssueTitleValue, IssueTitleValue} from '../../client/api/columns/contracts/title'
import type {Progress} from '../../client/api/columns/contracts/tracks'
import {
  IssueState,
  type IssueStateReason,
  type ParentIssue,
  type SubIssuesProgress,
} from '../../client/api/common-contracts'
import type {TrackedByItem} from '../../client/api/issues-graph/contracts'
import type {MemexItem} from '../../client/api/memex-items/contracts'
import {ItemType} from '../../client/api/memex-items/item-type'
import {
  CustomDateColumnId,
  CustomNumberColumnId,
  CustomTextColumnId,
  EndDateColumnId,
  ImpactColumnId,
  StageColumnId,
  StartDateColumnId,
  TeamColumnId,
} from './columns'
import {todayISOString} from './dates'
import {getIssueType} from './issue-types'
import {getLabel} from './labels'
import {getMilestoneByRepository} from './milestones'
import {getNextId} from './mock-ids'
import {getRepository} from './repositories'
import {getSingleSelectOptionValueFromName, stageOptions, statusOptions} from './single-select'
import {getTeamById} from './teams-text-column'
import {getUser} from './users'

interface CreateMockDraftIssueParams {
  title: EnrichedText
  priority: number
  status: string
  stage: string
  impact: string
  teamId?: number
  estimate?: number
  dueDate?: string
}

export const createMockDraftIssue = ({
  title,
  priority,
  status,
  stage,
  impact,
  teamId = 1,
  estimate = 5,
  dueDate = todayISOString,
}: CreateMockDraftIssueParams): MemexItem => {
  const team = getTeamById(teamId)
  const id = getNextId()
  const statusOption = getSingleSelectOptionValueFromName(status, statusOptions)
  const stageOption = getSingleSelectOptionValueFromName(stage, stageOptions)

  const titleData: DraftIssueTitleValue = {
    title,
  }

  return {
    id,
    contentType: ItemType.DraftIssue,
    content: {
      id,
    },
    priority,
    updatedAt: new Date().toISOString(),
    memexProjectColumnValues: [
      {
        memexProjectColumnId: SystemColumnId.Title,
        value: titleData,
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
      {
        memexProjectColumnId: CustomNumberColumnId,
        value: {
          value: estimate,
        },
      },
      {
        memexProjectColumnId: CustomDateColumnId,
        value: {
          value: dueDate,
        },
      },
    ],
  }
}

interface CreateMockIssueParams {
  isOpen: boolean
  issueNumber: number
  title: string
  priority: number
  assignees: Array<string>
  status: string
  stage: string
  impact: string
  repositoryId?: number
  milestoneId?: number
  teamId?: number
  labelIds?: Array<number>
  estimate?: number
  dueDate?: string
  stateReason?: IssueStateReason
  tracks?: Progress
  trackedBy?: Array<TrackedByItem>
  issueTypeId?: number
  parentIssue?: ParentIssue
  subIssuesProgress?: SubIssuesProgress
}

export const createMockIssue = ({
  isOpen,
  issueNumber,
  title,
  priority,
  assignees,
  status,
  stage,
  impact,
  repositoryId = 1,
  milestoneId = 3,
  teamId = 1,
  labelIds = [22],
  estimate = 3,
  dueDate = todayISOString,
  stateReason,
  tracks,
  trackedBy,
  parentIssue,
  issueTypeId = 22,
  subIssuesProgress,
}: CreateMockIssueParams): MemexItem => {
  const issueAssignees = assignees.sort().map(login => getUser(login))
  const repository = getRepository(repositoryId)
  const milestone = getMilestoneByRepository(repositoryId, milestoneId)
  const team = getTeamById(teamId)
  const id = getNextId()
  const labels = labelIds.map(labelId => getLabel(labelId))
  const statusOption = getSingleSelectOptionValueFromName(status, statusOptions)
  const stageOption = getSingleSelectOptionValueFromName(stage, stageOptions)
  const issueTypeOption = getIssueType(issueTypeId)

  const titleData: IssueTitleValue = {
    number: issueNumber,
    state: isOpen ? IssueState.Open : IssueState.Closed,
    stateReason,
    title: {raw: title, html: title},
    issueId: 2528582,
  }

  return {
    id,
    contentType: ItemType.Issue,
    content: {
      id,
      url: `https://github.com/github/memex/issues/${issueNumber}`,
      globalRelayId: '',
    },
    contentRepositoryId: repository.id,
    priority,
    updatedAt: new Date().toISOString(),
    memexProjectColumnValues: [
      {
        memexProjectColumnId: SystemColumnId.ParentIssue,
        value: parentIssue || null,
      },
      {
        memexProjectColumnId: SystemColumnId.SubIssuesProgress,
        value: subIssuesProgress || null,
      },
      {
        memexProjectColumnId: SystemColumnId.Title,
        value: titleData,
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
        memexProjectColumnId: SystemColumnId.LinkedPullRequests,
        value: [],
      },
      {
        memexProjectColumnId: SystemColumnId.Tracks,
        value: tracks ?? {total: 0, completed: 0, percent: 0},
      },
      {
        memexProjectColumnId: SystemColumnId.TrackedBy,
        value: trackedBy ?? [],
      },
      {
        memexProjectColumnId: SystemColumnId.IssueType,
        value: issueTypeOption,
      },
      {
        memexProjectColumnId: SystemColumnId.Repository,
        value: {
          ...repository,
        },
      },
      {
        memexProjectColumnId: SystemColumnId.Reviewers,
        value: [],
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
      {
        memexProjectColumnId: CustomNumberColumnId,
        value: {
          value: estimate,
        },
      },
      {
        memexProjectColumnId: CustomDateColumnId,
        value: {
          value: dueDate,
        },
      },
    ],
  }
}

type CreateMockRoadmapIssueParams = {
  issueNumber: number
  title: string
  priority: number

  startDate?: string | Date
  endDate?: string | Date
  dueDate?: string | Date

  isOpen?: boolean
  assignees?: Array<string>
  status?: string
  repositoryId?: number
  milestoneId?: number
}
export const createMockRoadmapIssue = ({
  assignees = [],
  isOpen = true,
  issueNumber,
  status = 'Todo',
  title,
  priority,
  repositoryId = 1,
  endDate,
  startDate,
  dueDate,
}: CreateMockRoadmapIssueParams): MemexItem => {
  const issueAssignees = assignees.sort().map(login => getUser(login))
  const repository = getRepository(repositoryId)
  const id = getNextId()
  const statusOption = getSingleSelectOptionValueFromName(status, statusOptions)

  const titleData: IssueTitleValue = {
    number: issueNumber,
    state: isOpen ? IssueState.Open : IssueState.Closed,
    title: {raw: title, html: title},
    issueId: 2528582,
  }

  const projectColumnValues: MemexItem['memexProjectColumnValues'] = [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: titleData,
    },
    {
      memexProjectColumnId: SystemColumnId.Assignees,
      value: issueAssignees,
    },
    {
      memexProjectColumnId: SystemColumnId.Labels,
      value: [],
    },
    {
      memexProjectColumnId: SystemColumnId.LinkedPullRequests,
      value: [],
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: {
        ...repository,
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Reviewers,
      value: [],
    },
    {
      memexProjectColumnId: SystemColumnId.Status,
      value: statusOption,
    },
  ]

  if (startDate) {
    projectColumnValues.push({
      memexProjectColumnId: StartDateColumnId,
      value: {
        value: typeof startDate === 'string' ? startDate : startDate.toISOString(),
      },
    })
  }

  if (endDate) {
    projectColumnValues.push({
      memexProjectColumnId: EndDateColumnId,
      value: {
        value: typeof endDate === 'string' ? endDate : endDate.toISOString(),
      },
    })
  }

  if (dueDate) {
    projectColumnValues.push({
      memexProjectColumnId: CustomDateColumnId,
      value: {
        value: typeof dueDate === 'string' ? dueDate : dueDate.toISOString(),
      },
    })
  }

  return {
    id,
    contentType: ItemType.Issue,
    content: {
      id,
      globalRelayId: '',
      url: `https://github.com/github/memex/issues/${issueNumber}`,
    },
    contentRepositoryId: repository.id,
    priority,
    updatedAt: new Date().toISOString(),
    memexProjectColumnValues: projectColumnValues,
  }
}
