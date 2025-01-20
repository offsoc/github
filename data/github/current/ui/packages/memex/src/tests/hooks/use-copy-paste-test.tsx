import type {Cell} from 'react-table'

import {MemexColumnDataType, SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import type {IssueTitleWithContentType, TitleValueWithContentType} from '../../client/api/columns/contracts/storage'
import type {Progress} from '../../client/api/columns/contracts/tracks'
import {
  IssueState,
  IssueStateReason,
  type IssueType,
  type Label,
  type LinkedPullRequest,
  type Milestone,
  MilestoneState,
  type ParentIssue,
  PullRequestState,
  type Repository,
  type Review,
  type SubIssuesProgress,
  type User,
} from '../../client/api/common-contracts'
import type {TrackedByItem} from '../../client/api/issues-graph/contracts'
import {ItemType} from '../../client/api/memex-items/item-type'
import {getCellClipboardContent} from '../../client/components/react_table/hooks/use-copy-paste/get-cell-clipboard-content'
import type {ClipboardEntry} from '../../client/components/react_table/hooks/use-copy-paste/types'
import type {TableDataType} from '../../client/components/react_table/table-data-type'

describe('useCopyPaste', () => {
  describe('copy cell', () => {
    it('can copy a title cell', () => {
      const title: IssueTitleWithContentType = {
        contentType: ItemType.Issue,
        value: {
          number: 1,
          state: IssueState.Open,
          title: {raw: 'title', html: 'title'},
          issueId: 242304242,
        },
      }
      const cell = createTitleCell(title)
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        columnId: SystemColumnId.Title,
        dataType: MemexColumnDataType.Title,
        text: 'title',
        value: {
          title: title.value.title,
        },
      })
    })

    it('can copy a assignees cell', () => {
      const assignees = [
        {id: 1, global_relay_id: 'MDQ6VXNl1', name: 'name1', login: 'login1', avatarUrl: 'avatarUrl1', isSpammy: false},
        {id: 2, global_relay_id: 'MDQ6VXNl2', name: 'name2', login: 'login2', avatarUrl: 'avatarUrl2', isSpammy: false},
      ]
      const cell = createAssigneesCell(assignees)
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        columnId: SystemColumnId.Assignees,
        dataType: MemexColumnDataType.Assignees,
        text: 'login1, login2',
        value: assignees,
      })
    })

    it('can copy a labels cell', () => {
      const labels = [
        {id: 1, name: 'name1', nameHtml: 'htmlName1', color: 'red', url: 'avatarUrl1'},
        {id: 2, name: 'name2', nameHtml: 'htmlName2', color: 'blue', url: 'avatarUrl2'},
      ]

      const cell = createLabelsCell(labels)
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        columnId: SystemColumnId.Labels,
        dataType: MemexColumnDataType.Labels,
        text: 'name1, name2',
        value: labels,
      })
    })

    it('can copy a milestone cell', () => {
      const milestone = {id: 1, title: 'title', url: 'url', state: MilestoneState.Open, repoNameWithOwner: ''}
      const cell = createMilestoneCell(milestone)
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        columnId: SystemColumnId.Milestone,
        dataType: MemexColumnDataType.Milestone,
        text: 'title',
        value: milestone,
      })
    })

    it('can copy an Issue Type cell', () => {
      const issueType = {id: 1, name: 'bug', description: ''}
      const cell = createIssueTypeCell(issueType)
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        columnId: SystemColumnId.IssueType,
        dataType: MemexColumnDataType.IssueType,
        text: 'bug',
        value: issueType,
      })
    })

    it('can copy a repository cell', () => {
      const repository = {id: 1, name: 'memex', nameWithOwner: 'github/memex', url: 'url'}
      const cell = createRepositoryCell(repository)
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        columnId: SystemColumnId.Repository,
        dataType: MemexColumnDataType.Repository,
        text: 'github/memex',
        value: repository,
      })
    })

    it('can copy a status cell', () => {
      const cell = createStatusCell([{id: '12345', name: 'option 1', nameHtml: 'option html 1 html'}], '12345')
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        columnId: SystemColumnId.Status,
        dataType: MemexColumnDataType.SingleSelect,
        text: 'option 1',
        value: {id: '12345'},
      })
    })

    it('can copy a text cell', () => {
      const cell = createTextCell(1, 'hi there')
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        columnId: 1,
        dataType: MemexColumnDataType.Text,
        text: 'hi there',
        value: {raw: 'hi there', html: 'hi there'},
      })
    })

    it('can copy a number cell', () => {
      const cell = createNumberCell(1, 1234)
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        columnId: 1,
        dataType: MemexColumnDataType.Number,
        text: '1234',
        value: {value: 1234},
      })
    })

    it('can copy a date cell', () => {
      const date = new Date(Date.UTC(2021, 5, 15))

      const cell = createDateCell(1, date)
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        columnId: 1,
        dataType: MemexColumnDataType.Date,
        text: 'Jun 15, 2021',
        value: {value: date},
      })
    })

    it('can copy a single select cell', () => {
      const cell = createSingleSelectCell(1, [{id: '12345', name: 'option 1', nameHtml: 'option html 1 html'}])
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        columnId: 1,
        dataType: MemexColumnDataType.SingleSelect,
        text: 'option 1',
        value: {id: '12345'},
      })
    })

    it('can copy an iteration cell', () => {
      const cell = createIterationCell(1, [{id: '12345', title: 'iteration 1'}], '12345')
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        columnId: 1,
        dataType: MemexColumnDataType.Iteration,
        text: 'iteration 1',
        value: {id: '12345'},
      })
    })

    it('can copy a completed iteration cell', () => {
      const completedIterationId = '6789'
      const completedIterationTitle = 'completed iteration 1'
      const cell = createIterationCell(1, [], completedIterationId, [
        {id: completedIterationId, title: completedIterationTitle},
      ])
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        columnId: 1,
        text: completedIterationTitle,
        dataType: MemexColumnDataType.Iteration,
        value: {id: completedIterationId},
      })
    })

    it('can copy a linked prs cell', () => {
      const linkedPullRequests = [
        {
          id: 102,
          number: 2,
          url: 'https://github.com/org/repo/pulls/102',
          isDraft: true,
          state: PullRequestState.Closed,
        },
        {
          id: 103,
          number: 3,
          url: 'https://github.com/org/repo/pulls/103',
          isDraft: false,
          state: PullRequestState.Open,
        },
      ]

      const cell = createLinkedPullRequestsCell(linkedPullRequests)
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        columnId: SystemColumnId.LinkedPullRequests,
        text: 'https://github.com/org/repo/pulls/102, https://github.com/org/repo/pulls/103',
        dataType: MemexColumnDataType.LinkedPullRequests,
        value: linkedPullRequests,
      })
    })

    it('can copy a reviewers cell', () => {
      const reviews: Array<Review> = [
        {reviewer: {id: 1, name: 'name1', avatarUrl: 'avatarUrl1', url: 'reviewerUrl1', type: 'User'}},
        {reviewer: {id: 2, name: 'name2', avatarUrl: 'avatarUrl2', url: 'reviewerUrl2', type: 'User'}},
      ]
      const cell = createReviewersCell(reviews)
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        columnId: SystemColumnId.Reviewers,
        text: 'name1, name2',
        dataType: MemexColumnDataType.Reviewers,
        value: reviews,
      })
    })

    it('can copy a tracked by cell', () => {
      const trackedBy: Array<TrackedByItem> = [
        {
          key: {ownerId: 1, itemId: 1, primaryKey: {uuid: '1234-5678-9012-3456'}},
          state: 'closed',
          title: 'test',
          url: 'https://github.com/github/memex/issues/123',
          repoName: 'memex',
          repoId: 1,
          userName: 'github',
          number: 123,
          labels: [],
          assignees: [],
          stateReason: IssueStateReason.Completed,
          completion: undefined,
        },
        {
          key: {ownerId: 1, itemId: 1, primaryKey: {uuid: '1234-5678-9012-3456'}},
          state: 'closed',
          title: 'test',
          url: 'https://github.com/github/github/issues/321',
          repoName: 'github',
          repoId: 1,
          userName: 'github',
          number: 321,
          labels: [],
          assignees: [],
          stateReason: IssueStateReason.NotPlanned,
          completion: undefined,
        },
      ]
      const cell = createTrackedByCell(trackedBy)
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        columnId: SystemColumnId.TrackedBy,
        text: 'https://github.com/github/memex/issues/123, https://github.com/github/github/issues/321',
        dataType: MemexColumnDataType.TrackedBy,
        value: trackedBy,
      })
    })

    it('can copy a tracks cell', () => {
      const progress: Progress = {percent: 50, completed: 5, total: 10}
      const cell = createTracksCell(progress)
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        columnId: SystemColumnId.Tracks,
        text: '50% of 10',
        dataType: MemexColumnDataType.Tracks,
        value: progress,
      })
    })

    it('can copy a sub-issues progress cell', () => {
      const progress: SubIssuesProgress = {id: 1, completed: 5, total: 10, percentCompleted: 50}
      const cell = createCell(SystemColumnId.SubIssuesProgress, MemexColumnDataType.SubIssuesProgress, progress)
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        html: '5 / 10 (50%)',
        text: '5 / 10 (50%)',
        dataType: MemexColumnDataType.SubIssuesProgress,
        value: progress,
      } satisfies ClipboardEntry)
    })

    it('can copy a parent-issue cell', () => {
      const parentIssue: ParentIssue = {
        id: 1,
        globalRelayId: 'I_kwARTg',
        number: 1234,
        nwoReference: 'github/github#1234',
        owner: 'github',
        repository: 'github',
        state: 'open',
        subIssueList: {
          completed: 2,
          percentCompleted: 50,
          total: 4,
        },
        title: 'My neat issue!',
        url: 'github.com/github/github/issues/1234',
      }

      const repositoryId = 4321

      const cell = createCell(
        SystemColumnId.ParentIssue,
        MemexColumnDataType.ParentIssue,
        parentIssue,
        undefined,
        ItemType.Issue,
        repositoryId,
      )

      const clipboard = getCellClipboardContent(cell)

      expect(clipboard).toMatchObject({
        html: '<a href="github.com/github/github/issues/1234">github/github#1234</a>',
        text: 'github.com/github/github/issues/1234',
        dataType: MemexColumnDataType.ParentIssue,
        value: parentIssue,
        repositoryId,
      } satisfies ClipboardEntry)
    })
  })

  describe('copy empty cells', () => {
    it('single select', () => {
      const cell = createStatusCell([{id: '12345', name: 'option 1', nameHtml: 'option html 1 html'}], null)
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard?.text).toEqual('')
    })

    it('iteration', () => {
      const cell = createIterationCell(1, [{id: '12345', title: 'iteration 1'}], undefined)
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard?.text).toEqual('')
    })

    it('text', () => {
      const cell = createTextCell(1, '')
      const clipboard = getCellClipboardContent(cell)

      expect(clipboard?.text).toEqual('')
    })
  })
})

function createTitleCell(columnValue: TitleValueWithContentType): Cell<TableDataType> {
  return createCell(SystemColumnId.Title, MemexColumnDataType.Title, columnValue)
}

function createAssigneesCell(assignees: Array<User>, repositoryId?: number, itemType?: ItemType): Cell<TableDataType> {
  return createCell(
    SystemColumnId.Assignees,
    MemexColumnDataType.Assignees,
    assignees,
    undefined,
    itemType,
    repositoryId,
  )
}

function createLabelsCell(labels: Array<Label>, repositoryId?: number, itemType?: ItemType): Cell<TableDataType> {
  return createCell(SystemColumnId.Labels, MemexColumnDataType.Labels, labels, undefined, itemType, repositoryId)
}

function createLinkedPullRequestsCell(
  labels: Array<LinkedPullRequest>,
  repositoryId?: number,
  itemType?: ItemType,
): Cell<TableDataType> {
  return createCell(
    SystemColumnId.LinkedPullRequests,
    MemexColumnDataType.LinkedPullRequests,
    labels,
    undefined,
    itemType,
    repositoryId,
  )
}

function createReviewersCell(reviews: Array<Review>, repositoryId?: number, itemType?: ItemType): Cell<TableDataType> {
  return createCell(SystemColumnId.Reviewers, MemexColumnDataType.Reviewers, reviews, undefined, itemType, repositoryId)
}

function createTrackedByCell(
  trackedBy: Array<TrackedByItem>,
  repositoryId?: number,
  itemType?: ItemType,
): Cell<TableDataType> {
  return createCell(
    SystemColumnId.TrackedBy,
    MemexColumnDataType.TrackedBy,
    trackedBy,
    undefined,
    itemType,
    repositoryId,
  )
}

function createTracksCell(progress: Progress, repositoryId?: number, itemType?: ItemType): Cell<TableDataType> {
  return createCell(SystemColumnId.Tracks, MemexColumnDataType.Tracks, progress, undefined, itemType, repositoryId)
}

function createMilestoneCell(
  milestone: Milestone,
  itemType: ItemType = ItemType.Issue,
  repositoryId?: number,
): Cell<TableDataType> {
  return createCell(
    SystemColumnId.Milestone,
    MemexColumnDataType.Milestone,
    milestone,
    undefined,
    itemType,
    repositoryId,
  )
}

function createIssueTypeCell(
  issueType: IssueType,
  itemType: ItemType = ItemType.Issue,
  repositoryId?: number,
): Cell<TableDataType> {
  return createCell(
    SystemColumnId.IssueType,
    MemexColumnDataType.IssueType,
    issueType,
    undefined,
    itemType,
    repositoryId,
  )
}

function createRepositoryCell(repository: Repository): Cell<TableDataType> {
  return createCell(SystemColumnId.Repository, MemexColumnDataType.Repository, repository)
}

function createStatusCell(
  options: Array<{id: string; name: string; nameHtml: string}>,
  selectionOptionId: string | null,
): Cell<TableDataType> {
  const columnValue = selectionOptionId ? {id: selectionOptionId} : {}
  return createCell(SystemColumnId.Status, MemexColumnDataType.SingleSelect, columnValue, {options})
}

function createTextCell(columnId: number, value: string): Cell<TableDataType> {
  const columnValue = {raw: value, html: value}
  return createCell(columnId, MemexColumnDataType.Text, columnValue)
}

function createNumberCell(columnId: number, value: number): Cell<TableDataType> {
  const columnValue = {value}
  return createCell(columnId, MemexColumnDataType.Number, columnValue)
}

function createDateCell(columnId: number, value: Date): Cell<TableDataType> {
  const columnValue = {value: value.toISOString().substring(0, 10)} //'2021-12-31'
  return createCell(columnId, MemexColumnDataType.Date, columnValue)
}

function createSingleSelectCell(
  columnId: number,
  options: Array<{id: string; name: string; nameHtml: string}>,
  selectedOptionId?: string,
): Cell<TableDataType> {
  const columnValue = selectedOptionId ? {id: selectedOptionId} : {id: options[0].id}
  return createCell(columnId, MemexColumnDataType.SingleSelect, columnValue, {options})
}

function createIterationCell(
  columnId: number,
  iterations: Array<{id: string; title: string}>,
  selectedIterationId?: string,
  completedIterations: Array<{id: string; title: string}> = [],
): Cell<TableDataType> {
  const columnValue = {id: selectedIterationId}
  return createCell(columnId, MemexColumnDataType.Iteration, columnValue, {
    configuration: {iterations, completedIterations},
  })
}

function createCell<ColValue, ColSettings>(
  columnId: number | SystemColumnId,
  columnType: MemexColumnDataType,
  columnValue: ColValue,
  columnSettings?: ColSettings,
  contentType?: ItemType,
  repositoryId?: number,
): Cell<TableDataType> {
  const columns: {[key: string]: ColValue} = {}
  columns[columnId] = columnValue

  const unknownValue: unknown = {
    column: {
      id: columnId.toString(),
      columnModel: {
        id: columnId,
        dataType: columnType,
        settings: columnSettings,
      },
    },
    row: {
      original: {
        contentType,
        contentRepositoryId: repositoryId,
        columns,
        getUrl: () => 'https://github.com/owner/repo/issues/123',
      },
    },
  }

  return unknownValue as Cell<TableDataType>
}
