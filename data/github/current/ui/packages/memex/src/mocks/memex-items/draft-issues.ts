import {SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import {PullRequestState, type User} from '../../client/api/common-contracts'
import type {DraftIssue} from '../../client/api/memex-items/contracts'
import {ItemType} from '../../client/api/memex-items/item-type'
import {getReviewerTeam} from '../data/teams'
import {getReviewerUser} from '../data/users'

export const LIMITED_ACCESS_USER_ID = 987
const LIMITED_ACCESS_USER_GLOBAL_RELAY_ID = 'MDQ6VXNlcjA='

export const DefaultDraftIssue: DraftIssue = {
  contentType: ItemType.DraftIssue,
  content: {
    id: 1,
  },
  id: 1,
  priority: 0,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        title: {
          raw: 'Here is a Draft Issue!',
          html: 'Here is a Draft Issue!',
        },
      },
    },
  ],
}

export const DefaultDraftIssueWithLabels: DraftIssue = {
  contentType: ItemType.DraftIssue,
  content: {
    id: 1,
  },
  id: 1,
  priority: 0,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Labels,
      value: [
        {
          color: 'd73a4a',
          id: 1672383158,
          name: 'bug',
          nameHtml: 'bug',
          url: 'https://github.com/github/memex/labels/bug',
        },
        {
          color: 'ffffff',
          id: 1672383159,
          name: 'zebra',
          nameHtml: 'zebra',
          url: 'https://github.com/github/memex/labels/zebra',
        },
        {
          color: '3370C4',
          id: 2648860752,
          name: '🏓 layout:table',
          nameHtml:
            '\u003cg-emoji class="g-emoji" alias="ping_pong" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f3d3.png"\u003e🏓\u003c/g-emoji\u003e layout:table',
          url: 'https://github.com/github/memex/labels/%F0%9F%8F%93%20layout%3Atable',
        },
      ],
    },
  ],
}

export const DraftIssueLink: DraftIssue = {
  contentType: ItemType.DraftIssue,
  content: {
    id: 11,
  },
  id: 11,
  priority: 11,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        title: {
          raw: 'https://google.com',
          html: '<a href="https://google.com">https://google.com</a>',
        },
      },
    },
  ],
}

export const DraftIssueWithMultipleAssignees: DraftIssue = {
  contentType: ItemType.DraftIssue,
  content: {
    id: 1,
  },
  id: 1,
  priority: 0,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        title: {
          raw: 'Here is a Draft Issue!',
          html: 'Here is a Draft Issue!',
        },
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Assignees,
      value: [
        {
          id: 2,
          global_relay_id: '2',
          login: 'second',
          name: 'second',
          avatarUrl: '/assets/avatars/u/0.png',
        } as User,
        {
          id: 1,
          global_relay_id: '1',
          login: 'first',
          name: 'first',
          avatarUrl: '/assets/avatars/u/0.png',
        } as User,
      ],
    },
  ],
}

export const DraftIssueWithLimitedAssignee: DraftIssue = {
  contentType: ItemType.DraftIssue,
  content: {
    id: 1,
  },
  id: 1,
  priority: 0,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        title: {
          raw: 'Here is a Draft Issue!',
          html: 'Here is a Draft Issue!',
        },
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Assignees,
      value: [
        {
          id: LIMITED_ACCESS_USER_ID,
          global_relay_id: LIMITED_ACCESS_USER_GLOBAL_RELAY_ID,
          login: 'limitedaccessuser',
          name: 'Limited Access User',
          avatarUrl: '/assets/avatars/u/0.png',
        } as User,
      ],
    },
  ],
}

export const DraftIssueWithPartialColumns: DraftIssue = {
  id: 55,
  contentType: ItemType.DraftIssue,
  content: {
    id: 53,
  },
  priority: 1,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        title: {
          raw: 'Issue Title!',
          html: 'Issue Title!',
        },
      },
    },
  ],
}

export const DraftIssueWithMultipleReviewers: DraftIssue = {
  contentType: ItemType.DraftIssue,
  content: {
    id: 1,
  },
  id: 1,
  priority: 0,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        title: {
          raw: 'Here is a Draft Issue!',
          html: 'Here is a Draft Issue!',
        },
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Reviewers,
      value: [{reviewer: getReviewerTeam('Memex Team 1')}, {reviewer: getReviewerUser('dmarcey')}],
    },
  ],
}

export const DraftIssueWithMultipleLinkedPullRequests: DraftIssue = {
  contentType: ItemType.DraftIssue,
  content: {
    id: 1,
  },
  id: 1,
  priority: 0,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        title: {
          raw: 'Here is a Draft Issue!',
          html: 'Here is a Draft Issue!',
        },
      },
    },
    {
      memexProjectColumnId: SystemColumnId.LinkedPullRequests,
      value: [
        {
          id: 123,
          isDraft: false,
          number: 123,
          state: PullRequestState.Merged,
          url: 'https://github.com/github/memex/issues/123',
        },
        {
          id: 1,
          isDraft: false,
          number: 1,
          state: PullRequestState.Open,
          url: 'https://github.com/github/memex/issues/1',
        },
        {
          id: 500,
          isDraft: false,
          number: 500,
          state: PullRequestState.Open,
          url: 'https://github.com/github/memex/issues/500',
        },
      ],
    },
  ],
}
