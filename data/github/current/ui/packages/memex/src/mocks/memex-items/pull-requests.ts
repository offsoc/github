import {SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import {PullRequestState, type User} from '../../client/api/common-contracts'
import type {PullRequest} from '../../client/api/memex-items/contracts'
import {ItemType} from '../../client/api/memex-items/item-type'
import {CustomDateColumnId, CustomNumberColumnId, CustomTextColumnId, StageColumnId} from '../data/columns'
import {tomorrowISOString} from '../data/dates'
import {getMilestoneByRepository} from '../data/milestones'
import {mockMilestonelessRepo, mockPrivateRepo, mockPublicRepo} from '../data/repositories'
import {getSingleSelectOptionValueFromName, stageOptions, statusOptions} from '../data/single-select'
import {getReviewerTeam} from '../data/teams'
import {getReviewerUser, getUser, mockUsers} from '../data/users'

function mustExist<T>(item: T | null | undefined) {
  if (item == null) throw new Error('Unable to find user')
  return item
}

const restOfTheContent = {
  user: mustExist(mockUsers.find(u => u.login === 'abdelhamid-attaby')),
  body: ``,
  bodyHtml: ``,
  createdAt: '2021-11-16',
}

export const DefaultOpenPullRequest: PullRequest = {
  id: 5,
  contentType: ItemType.PullRequest,
  content: {
    id: 5,
    url: 'https://github.com/github/memex/pull/337',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 4,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 5,
        state: PullRequestState.Open,
        title: {raw: 'Fixes all the bugs', html: 'Fixes all the bugs'},
        isDraft: false,
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Milestone,
      value: getMilestoneByRepository(mockPublicRepo.id, 2),
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: {...mockPublicRepo},
    },
    {
      memexProjectColumnId: SystemColumnId.Status,
      value: getSingleSelectOptionValueFromName('Backlog', statusOptions),
    },
    {
      memexProjectColumnId: CustomDateColumnId,
      value: {value: tomorrowISOString},
    },
    {
      memexProjectColumnId: CustomTextColumnId,
      value: {
        raw: '🎉 https://github.com 🎉 https://microsoft.com',
        html: `<g-emoji class="g-emoji" alias="tada" fallback-src="http://assets.github.com/images/icons/emoji/unicode/1f389.png">🎉</g-emoji> <a href="https://github.com">https://github.com</a> <g-emoji class="g-emoji" alias="tada" fallback-src="http://assets.github.com/images/icons/emoji/unicode/1f389.png">🎉</g-emoji> <a href="https://microsoft.com">https://microsoft.com</a>`,
      },
    },
    {
      memexProjectColumnId: StageColumnId,
      value: getSingleSelectOptionValueFromName('Up Next', stageOptions),
    },
  ],
}

export const DefaultClosedPullRequest: PullRequest = {
  id: 4,
  contentType: ItemType.PullRequest,
  content: {
    id: 4,
    url: 'https://github.com/github/memex/pull/337',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 3,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 4,
        state: PullRequestState.Closed,
        title: {raw: 'Update styles for table', html: 'Update styles for table'},
        isDraft: true,
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Assignees,
      value: [getUser('mikesurowiec')],
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: {...mockPublicRepo},
    },
    {
      memexProjectColumnId: SystemColumnId.Reviewers,
      value: [{reviewer: getReviewerUser('dmarcey')}, {reviewer: getReviewerTeam('Memex Team 1')}],
    },
    {
      memexProjectColumnId: CustomTextColumnId,
      value: {
        raw: 'Another value',
        html: 'Another value',
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Status,
      value: getSingleSelectOptionValueFromName('Done', statusOptions),
    },
    {
      memexProjectColumnId: CustomNumberColumnId,
      value: {
        value: 10,
      },
    },
    {
      memexProjectColumnId: StageColumnId,
      value: getSingleSelectOptionValueFromName('Closed', stageOptions),
    },
  ],
}

export const DefaultMergedPullRequest: PullRequest = {
  id: 6,
  contentType: ItemType.PullRequest,
  content: {
    id: 6,
    url: 'https://github.com/github/memex/pull/337',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 5,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 6,
        state: PullRequestState.Merged,
        title: {raw: 'Account for multiple assignees', html: 'Account for multiple assignees'},
        isDraft: false,
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Assignees,
      value: [getUser('schustafa')],
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: {...mockPublicRepo},
    },
    {
      memexProjectColumnId: SystemColumnId.Reviewers,
      value: [{reviewer: getReviewerUser('smockle')}],
    },
  ],
}

export const DefaultDraftPullRequest: PullRequest = {
  id: 7,
  contentType: ItemType.PullRequest,
  content: {
    id: 7,
    url: 'https://github.com/github/memex/pull/337',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 6,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 7,
        state: PullRequestState.Open,
        title: {
          raw: 'Experimental changes to core architecture ',
          html: 'Experimental changes to <code>core architecture</code>',
        },
        isDraft: true,
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Assignees,
      value: [getUser('dusave')],
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: {...mockPublicRepo},
    },
    {
      memexProjectColumnId: CustomTextColumnId,
      value: {
        raw: ':tada: https://github.com :tada: https://microsoft.com',
        html: `<g-emoji class="g-emoji" alias="tada" fallback-src="http://assets.github.com/images/icons/emoji/unicode/1f389.png">🎉</g-emoji> <a href="https://github.com">https://github.com</a> <g-emoji class="g-emoji" alias="tada" fallback-src="http://assets.github.com/images/icons/emoji/unicode/1f389.png">🎉</g-emoji> <a href="https://microsoft.com">https://microsoft.com</a>`,
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Reviewers,
      value: mockUsers.slice(0, 7).map(u => {
        return {reviewer: getReviewerUser(u.login)}
      }),
    },
  ],
}

export const DefaultPullRequestFromMilestonelessRepository: PullRequest = {
  id: 12,
  contentType: ItemType.PullRequest,
  content: {
    id: 8,
    url: 'https://github.com/facebook/react/pull/337',
    ...restOfTheContent,
  },
  contentRepositoryId: mockMilestonelessRepo.id,
  priority: 6,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 8,
        state: PullRequestState.Closed,
        title: {raw: 'More milestones please', html: 'More milestones please'},
        isDraft: false,
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Milestone,
      value: null,
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: mockMilestonelessRepo,
    },
  ],
}

export const PullRequestWithReviewerMatt: PullRequest = {
  id: 13,
  contentType: ItemType.PullRequest,
  content: {
    id: 13,
    url: 'https://github.com/github/memex/pull/337',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 3,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 4,
        state: PullRequestState.Closed,
        title: {raw: 'Update styles for table', html: 'Update styles for table'},
        isDraft: true,
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Reviewers,
      value: [{reviewer: getReviewerUser('azenMatt')}],
    },
  ],
}

export const PullRequestWithLabels: PullRequest = {
  id: 5,
  contentType: ItemType.PullRequest,
  content: {
    id: 5,
    url: 'https://github.com/github/memex/pull/337',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 4,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 5,
        state: PullRequestState.Open,
        title: {raw: 'Fixes all the bugs', html: 'Fixes all the bugs'},
        isDraft: false,
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Milestone,
      value: getMilestoneByRepository(mockPublicRepo.id, 2),
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: {...mockPublicRepo},
    },
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

export const PullRequestWithMultipleAssignees: PullRequest = {
  id: 5,
  contentType: ItemType.PullRequest,
  content: {
    id: 5,
    url: 'https://github.com/github/memex/pull/337',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 4,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 5,
        state: PullRequestState.Open,
        title: {raw: 'Fixes all the bugs', html: 'Fixes all the bugs'},
        isDraft: false,
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Milestone,
      value: getMilestoneByRepository(mockPublicRepo.id, 2),
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: {...mockPublicRepo},
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

export const PullRequestWithMultipleReviewers: PullRequest = {
  id: 5,
  contentType: ItemType.PullRequest,
  content: {
    id: 5,
    url: 'https://github.com/github/memex/pull/337',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 4,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 5,
        state: PullRequestState.Open,
        title: {raw: 'Fixes all the bugs', html: 'Fixes all the bugs'},
        isDraft: false,
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Milestone,
      value: getMilestoneByRepository(mockPublicRepo.id, 2),
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: {...mockPublicRepo},
    },
    {
      memexProjectColumnId: SystemColumnId.Reviewers,
      value: [{reviewer: getReviewerTeam('Memex Team 1')}, {reviewer: getReviewerUser('dmarcey')}],
    },
  ],
}

export const PullRequestWithMultipleLinkedPullRequests: PullRequest = {
  id: 5,
  contentType: ItemType.PullRequest,
  content: {
    id: 5,
    url: 'https://github.com/github/memex/pull/337',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 4,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 5,
        state: PullRequestState.Open,
        title: {raw: 'Fixes all the bugs', html: 'Fixes all the bugs'},
        isDraft: false,
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Milestone,
      value: getMilestoneByRepository(mockPublicRepo.id, 2),
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: {...mockPublicRepo},
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

export const OpenPullRequestInPrivateRepo: PullRequest = {
  id: 5,
  contentType: ItemType.PullRequest,
  content: {
    id: 5,
    url: 'https://github.com/github/memex/pull/337',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPrivateRepo.id,
  priority: 4,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 5,
        state: PullRequestState.Open,
        title: {raw: 'Fixes all the bugs', html: 'Fixes all the bugs'},
        isDraft: false,
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: {...mockPrivateRepo},
    },
    {
      memexProjectColumnId: SystemColumnId.Status,
      value: getSingleSelectOptionValueFromName('Backlog', statusOptions),
    },
    {
      memexProjectColumnId: CustomDateColumnId,
      value: {value: tomorrowISOString},
    },
    {
      memexProjectColumnId: CustomTextColumnId,
      value: {
        raw: '🎉 https://github.com 🎉 https://microsoft.com',
        html: `<g-emoji class="g-emoji" alias="tada" fallback-src="http://assets.github.com/images/icons/emoji/unicode/1f389.png">🎉</g-emoji> <a href="https://github.com">https://github.com</a> <g-emoji class="g-emoji" alias="tada" fallback-src="http://assets.github.com/images/icons/emoji/unicode/1f389.png">🎉</g-emoji> <a href="https://microsoft.com">https://microsoft.com</a>`,
      },
    },
    {
      memexProjectColumnId: StageColumnId,
      value: getSingleSelectOptionValueFromName('Up Next', stageOptions),
    },
  ],
}
