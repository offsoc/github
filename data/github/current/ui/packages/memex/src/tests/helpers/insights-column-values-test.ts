import {MemexColumnDataType, SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import type {ColumnData} from '../../client/api/columns/contracts/storage'
import {IssueState} from '../../client/api/common-contracts'
import {ItemType} from '../../client/api/memex-items/item-type'
import getInsightColumnValues from '../../client/helpers/insights-column-values'
import {createColumnModel} from '../../client/models/column-model'
import {CustomDateColumnId, CustomNumberColumnId, TeamColumnId} from '../../mocks/data/columns'
import {mockIssueTypes} from '../../mocks/data/issue-types'
import {mockLabels} from '../../mocks/data/labels'
import {getMilestoneByRepository} from '../../mocks/data/milestones'
import {mockLinkedPullRequests} from '../../mocks/data/pull-requests'
import {mockPublicRepo} from '../../mocks/data/repositories'
import {getSingleSelectOptionValueFromName, statusOptions} from '../../mocks/data/single-select'
import {getReviewerTeam} from '../../mocks/data/teams'
import {getReviewerUser, getUser} from '../../mocks/data/users'

const CustomIterationColumnId = 20

const populatedColumnData: ColumnData = {
  Title: {
    contentType: ItemType.Issue,
    value: {
      number: 3,
      state: IssueState.Open,
      issueId: 214242,
      title: {raw: 'This is a title', html: 'Fix this <code>issue</code> please!'},
    },
  },
  Assignees: [getUser('traumverloren')],
  Milestone: getMilestoneByRepository(mockPublicRepo.id, 4),
  [SystemColumnId.IssueType]: mockIssueTypes[0],
  Labels: [mockLabels[0]],
  'Linked pull requests': mockLinkedPullRequests.slice(0, 3),
  Repository: {...mockPublicRepo},
  Reviewers: [{reviewer: getReviewerUser('dmarcey')}, {reviewer: getReviewerTeam('Memex Team 1')}],
  Status: getSingleSelectOptionValueFromName('Backlog', statusOptions) || undefined,
  [CustomNumberColumnId]: {value: 1},
  [TeamColumnId]: {
    raw: 'Novelty Aardvarks',
    html: 'Novelty Aardvarks',
  },
  [CustomDateColumnId]: {value: '2022-02-11'},
  [CustomIterationColumnId]: {id: 'current-iteration'},
  'Parent issue': {
    id: 57,
    globalRelayId: 'I_kwARSw',
    number: 100,
    owner: 'github',
    state: 'open',
    title: 'Parent Issue',
    repository: 'github/memex',
    nwoReference: 'github/memex#100',
    url: 'https://github.com/github/memex/issues/100',
    subIssueList: {
      completed: 0,
      percentCompleted: 0,
      total: 1,
    },
  },
}

const emptyColumnData: ColumnData = {
  Title: {
    contentType: ItemType.Issue,
    value: {
      number: 3,
      state: IssueState.Open,
      issueId: 214242,
      title: {raw: 'This is a title', html: 'Fix this <code>issue</code> please!'},
    },
  },
  Assignees: [],
  Milestone: undefined,
  Labels: [],
  'Linked pull requests': [],
  Repository: undefined,
  Reviewers: [],
  Status: undefined,
  [CustomNumberColumnId]: undefined,
  [TeamColumnId]: undefined,
  [CustomDateColumnId]: undefined,
  [CustomIterationColumnId]: undefined,
  'Parent issue': undefined,
}

const defaultProps = {
  databaseId: 1,
  position: 1,
  userDefined: false,
  defaultColumn: false,
  settings: {width: 600},
}

describe('insights column values', () => {
  describe('getInsightColumnValues', () => {
    it('returns a SingleSelect column value', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.SingleSelect,
        id: SystemColumnId.Status,
        name: 'Status',
        settings: {
          options: [
            {
              id: '20e5d8ab',
              name: 'Backlog',
              nameHtml: 'Backlog',
              description: 'Description',
              descriptionHtml: 'Description',
              color: 'BLUE',
            },
          ],
        },
      })

      expect(getInsightColumnValues(columnModel, populatedColumnData)).toEqual(['Backlog'])
    })

    it('returns `No Status` when no SingleSelect is found', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.SingleSelect,
        id: SystemColumnId.Status,
        name: 'Status',
        settings: {
          options: [
            {
              id: '20e5d8ab',
              name: 'Backlog',
              nameHtml: 'Backlog',
              description: 'Description',
              descriptionHtml: 'Description',
              color: 'BLUE',
            },
          ],
        },
      })

      expect(getInsightColumnValues(columnModel, emptyColumnData)).toEqual(['No Status'])
    })

    it('returns a SingleSelect column value affixed by (n) when there are options w/ duplicate names', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.SingleSelect,
        id: SystemColumnId.Status,
        name: 'Status',
        settings: {
          options: [
            {
              id: '20e5d8ad',
              name: 'Backlog',
              nameHtml: 'Backlog',
              description: 'Description',
              descriptionHtml: 'Description',
              color: 'BLUE',
            },
            {
              id: '20e5d8ac',
              name: 'Backlog',
              nameHtml: 'Backlog',
              description: 'Description',
              descriptionHtml: 'Description',
              color: 'BLUE',
            },
            {
              id: '20e5d8ab',
              name: 'Backlog',
              nameHtml: 'Backlog',
              description: 'Description',
              descriptionHtml: 'Description',
              color: 'BLUE',
            },
          ],
        },
      })

      expect(getInsightColumnValues(columnModel, populatedColumnData)).toEqual(['Backlog (2)'])
    })

    it('returns a Milestone column value', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.Milestone,
        id: SystemColumnId.Milestone,
        name: 'Milestone',
      })

      expect(getInsightColumnValues(columnModel, populatedColumnData)).toEqual(['Sprint 9'])
    })

    it('returns `No Milestone` when no Milestone is found', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.Milestone,
        id: SystemColumnId.Milestone,
        name: 'Milestone',
      })

      expect(getInsightColumnValues(columnModel, emptyColumnData)).toEqual(['No Milestone'])
    })

    it('returns an Issue Type column value', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.IssueType,
        id: SystemColumnId.IssueType,
        name: 'Type',
      })

      expect(getInsightColumnValues(columnModel, populatedColumnData)).toEqual(['Batch'])
    })

    it('returns `No Type` when no Issue Type is found', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.IssueType,
        id: SystemColumnId.IssueType,
        name: 'Type',
      })

      expect(getInsightColumnValues(columnModel, emptyColumnData)).toEqual(['No Type'])
    })

    it('returns a Repository column value', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.Repository,
        id: SystemColumnId.Repository,
        name: 'Repository',
      })

      expect(getInsightColumnValues(columnModel, populatedColumnData)).toEqual(['github/memex'])
    })

    it('returns `No Repository` when no Repository is found', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.Repository,
        id: SystemColumnId.Repository,
        name: 'Repository',
      })

      expect(getInsightColumnValues(columnModel, emptyColumnData)).toEqual(['No Repository'])
    })

    it('returns a column value', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.Date,
        id: CustomDateColumnId,
        name: 'Due Date',
      })

      expect(getInsightColumnValues(columnModel, populatedColumnData)).toEqual(['Feb 11, 2022'])
    })

    it('returns `No Due Date` when no Date is found', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.Date,
        id: CustomDateColumnId,
        name: 'Due Date',
      })

      expect(getInsightColumnValues(columnModel, emptyColumnData)).toEqual(['No Due Date'])
    })

    it('returns a Number column value', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.Number,
        id: CustomNumberColumnId,
        name: 'Estimate',
      })

      expect(getInsightColumnValues(columnModel, populatedColumnData)).toEqual(['1'])
    })

    it('returns `No Estimate` when no Number is found', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.Number,
        id: CustomNumberColumnId,
        name: 'Estimate',
      })

      expect(getInsightColumnValues(columnModel, emptyColumnData)).toEqual(['No Estimate'])
    })

    it('returns Labels column values', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.Labels,
        id: SystemColumnId.Labels,
        name: 'Labels',
      })

      expect(getInsightColumnValues(columnModel, populatedColumnData)).toEqual(['enhancement ✨'])
    })

    it('returns `No Labels` when no Labels are found', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.Labels,
        id: SystemColumnId.Labels,
        name: 'Labels',
      })

      expect(getInsightColumnValues(columnModel, emptyColumnData)).toEqual(['No Labels'])
    })

    it('returns LinkedPullRequests column values', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.LinkedPullRequests,
        id: SystemColumnId.LinkedPullRequests,
        name: 'Linked pull requests',
      })

      expect(getInsightColumnValues(columnModel, populatedColumnData)).toEqual(['123', '456', '789'])
    })

    it('returns `No Linked pull requests` when no Linked pull requests are found', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.LinkedPullRequests,
        id: SystemColumnId.LinkedPullRequests,
        name: 'Linked pull requests',
      })

      expect(getInsightColumnValues(columnModel, emptyColumnData)).toEqual(['No Linked pull requests'])
    })

    it('returns Assignees column values', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.Assignees,
        id: SystemColumnId.Assignees,
        name: 'Assignees',
      })

      expect(getInsightColumnValues(columnModel, populatedColumnData)).toEqual(['traumverloren'])
    })

    it('returns `No Assignees` when no Assignees are found', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.Assignees,
        id: SystemColumnId.Assignees,
        name: 'Assignees',
      })

      expect(getInsightColumnValues(columnModel, emptyColumnData)).toEqual(['No Assignees'])
    })

    it('returns Reviewers column values', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.Reviewers,
        id: SystemColumnId.Reviewers,
        name: 'Reviewers',
      })

      expect(getInsightColumnValues(columnModel, populatedColumnData)).toEqual(['dmarcey', 'Memex Team 1'])
    })

    it('returns `No Reviewers` when no Reviewers are found', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.Reviewers,
        id: SystemColumnId.Reviewers,
        name: 'Reviewers',
      })

      expect(getInsightColumnValues(columnModel, emptyColumnData)).toEqual(['No Reviewers'])
    })

    it('returns a Iteration column value', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.Iteration,
        id: CustomIterationColumnId,
        name: 'Estimate',
        settings: {
          configuration: {
            iterations: [
              {
                id: 'current-iteration',
                title: 'Current iteration',
                titleHtml: 'Current iteration as HTML',
                startDate: '2021-10-20',
                duration: 14,
              },
            ],

            completedIterations: [],
            startDay: 1,
            duration: 14,
          },
        },
      })

      expect(getInsightColumnValues(columnModel, populatedColumnData)).toEqual(['Current iteration'])
    })

    it('returns a Iteration column value affixed by (n) when there are options w/ duplicate names', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.Iteration,
        id: CustomIterationColumnId,
        name: 'Estimate',
        settings: {
          configuration: {
            iterations: [
              {
                id: 'current-iteration-a',
                title: 'Current iteration',
                titleHtml: 'Current iteration as HTML',
                startDate: '2021-10-20',
                duration: 14,
              },
              {
                id: 'current-iteration-b',
                title: 'Current iteration',
                titleHtml: 'Current iteration as HTML',
                startDate: '2021-10-20',
                duration: 14,
              },
              {
                id: 'current-iteration',
                title: 'Current iteration',
                titleHtml: 'Current iteration as HTML',
                startDate: '2021-10-20',
                duration: 14,
              },
            ],
            completedIterations: [],
            startDay: 1,
            duration: 14,
          },
        },
      })

      expect(getInsightColumnValues(columnModel, populatedColumnData)).toEqual(['Current iteration (2)'])
    })

    it('returns a Parent Issue column value', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.ParentIssue,
        id: SystemColumnId.ParentIssue,
        name: 'Parent Issue',
      })

      expect(getInsightColumnValues(columnModel, populatedColumnData)).toEqual(['Parent Issue'])
    })

    it('returns `No Parent Issue` when no parent issue is found', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.ParentIssue,
        id: SystemColumnId.ParentIssue,
        name: 'Parent Issue',
      })

      expect(getInsightColumnValues(columnModel, emptyColumnData)).toEqual(['No Parent Issue'])
    })

    it('throws error for unsupported column data types', () => {
      const columnModel = createColumnModel({
        ...defaultProps,
        dataType: MemexColumnDataType.Title,
        id: SystemColumnId.Title,
        name: 'Title',
      })

      expect(() => getInsightColumnValues(columnModel, populatedColumnData)).toThrow(
        'title column is not a supported chart data type',
      )
    })
  })
})
