import type {Meta} from '@storybook/react'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {IssueTimeline} from './IssueTimeline'
import type {MockResolverContext} from 'relay-test-utils/lib/RelayMockPayloadGenerator'
import {formatISO, subDays} from 'date-fns'
import {Timeline} from '@primer/react'
import {IssueTimelineGraphqlQuery, IssueTimelineTest} from './__tests__/IssueTimelineTestShared'
import type {IssueTimelineTestSharedQuery} from './__tests__/__generated__/IssueTimelineTestSharedQuery.graphql'
import {noop} from '@github-ui/noop'

const meta = {
  title: 'IssueViewer',
  component: IssueTimelineTest,
  decorators: [
    Story => (
      <Wrapper>
        <Timeline>
          <Story />
        </Timeline>
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof IssueTimelineTest>

export default meta

type IssuesTimelineQueries = {
  issueTimelineQuery: IssueTimelineTestSharedQuery
}
const getTimelineExample = (nodes: object[]) =>
  ({
    decorators: [relayDecorator<typeof IssueTimeline, IssuesTimelineQueries>],
    parameters: {
      relay: {
        queries: {
          issueTimelineQuery: {
            type: 'preloaded',
            query: IssueTimelineGraphqlQuery,
            variables: {owner: 'github', repo: 'github', number: 123},
          },
        },
        mockResolvers: {
          Issue: ctx => {
            // Inner fragments that expect issues would fall on this resolver
            // so we only return something if it's for the main timeline issue
            if (ctx.name !== 'issue') return

            return {isTransferInProgress: false, viewerCanPush: true}
          },
          IssueTimelineItemsConnection: (ctx: MockResolverContext) => {
            // Due to our timeline split to get first and last events with a load in the middle
            // we need to make sure one of them doesn't have edges or it will duplicate info when mocking
            if (ctx.alias === 'frontTimeline') return {edges: []}

            return {
              edges: nodes,
            }
          },
        },
        mapStoryArgs: ({queryRefs}) => ({
          queryRef: queryRefs.issueTimelineQuery,
          viewer: 'monalisa',
          relayConnectionIds: [],
          navigate: noop,
        }),
      },
      a11y: {
        config: {
          rules: [
            {
              id: 'landmark-unique',
              enabled: false,
            },
          ],
        },
      },
    },
  }) satisfies RelayStoryObj<typeof IssueTimeline, IssuesTimelineQueries>

const getEventNode = (eventType: string, content: object) => ({
  node: {
    __typename: eventType,
    ...content,
  },
})

const today = new Date()

const mockUsers = {
  andrefcdias: {
    login: 'andrefcdias',
    avatarUrl: 'https://avatars.githubusercontent.com/u/39736248?v=4',
  },
  monalisa: {
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
  },
  hubot: {
    login: 'hubot',
    avatarUrl: 'https://avatars.githubusercontent.com/u/480938?v=4',
  },
}

const mockRepositories = {
  base: {
    id: '100',
    name: 'issues',
    nameWithOwner: 'github/issues',
    isPrivate: false,
    owner: {
      login: 'github',
    },
  },
  private: {
    id: '101',
    name: 'github',
    nameWithOwner: 'github/github',
    isPrivate: true,
    owner: {
      login: 'github',
    },
  },
  public: {
    id: '102',
    name: 'react',
    nameWithOwner: 'primer/react',
    isPrivate: false,
    owner: {
      login: 'primer',
    },
  },
}

const mockRealisticNodes = [
  getEventNode('AssignedEvent', {
    createdAt: formatISO(subDays(today, 10)),
    actor: mockUsers.andrefcdias,
    assignee: mockUsers.andrefcdias,
  }),
  getEventNode('AssignedEvent', {
    createdAt: formatISO(subDays(today, 10)),
    actor: mockUsers.hubot,
    assignee: mockUsers.monalisa,
  }),
  getEventNode('UnassignedEvent', {
    createdAt: formatISO(subDays(today, 10)),
    actor: mockUsers.hubot,
    assignee: mockUsers.andrefcdias,
  }),
  getEventNode('MilestonedEvent', {
    createdAt: formatISO(subDays(today, 10)),
    actor: mockUsers.andrefcdias,
    milestoneTitle: 'M2',
  }),
  getEventNode('IssueComment', {
    createdAt: formatISO(subDays(today, 2)),
    lastEditedAt: formatISO(subDays(today, 2)),
    updatedAt: formatISO(subDays(today, 2)),
    bodyHTML:
      "I've been looking into this issue, and I think the root cause might be related to the recent updates in the API. I suggest we investigate further and gather more data to pinpoint the exact problem.",
    authorAssociation: 'OWNER',
    author: mockUsers.andrefcdias,
    authorToRepoOwnerSponsorship: null,
    authoredBySubjectAuthor: true,
    createdViaEmail: true,
    isMinimized: false,
    isHidden: false,
    minimizedReason: null,
    reactionGroups: [],
    showFirstContributionPrompt: false,
    spammy: false,
    url: 'comment_url',
    viaApp: false,
    viewerCanBlockFromOrg: false,
    viewerCanDelete: false,
    viewerCanMinimize: false,
    viewerCanReact: false,
    viewerCanReadUserContentEdits: false,
    viewerCanReport: false,
    viewerCanReportToMaintainer: false,
    viewerCanSeeDeleteButton: false,
    viewerCanSeeMinimizeButton: false,
    viewerCanSeeUnminimizeButton: false,
    viewerCanUnblockFromOrg: false,
    viewerCanUpdate: false,
    viewerCannotUpdateReasons: [],
    viewerDidAuthor: true,
    viewerRelationship: 'OWNER',
  }),
  getEventNode('IssueComment', {
    createdAt: formatISO(subDays(today, 2)),
    lastEditedAt: formatISO(subDays(today, 2)),
    updatedAt: formatISO(subDays(today, 2)),
    bodyHTML:
      "I agree with @andrefcdias. Additionally, I noticed a similar issue in another project, and it was related to a configuration conflict. Let's review the project settings and see if anything stands out.",
    authorAssociation: 'NONE',
    author: mockUsers.monalisa,
    authorToRepoOwnerSponsorship: null,
    authoredBySubjectAuthor: true,
    createdViaEmail: false,
    isMinimized: false,
    isHidden: false,
    minimizedReason: null,
    reactionGroups: [],
    showFirstContributionPrompt: false,
    spammy: false,
    url: 'comment_url',
    viaApp: false,
    viewerCanBlockFromOrg: false,
    viewerCanDelete: false,
    viewerCanMinimize: false,
    viewerCanReact: false,
    viewerCanReadUserContentEdits: false,
    viewerCanReport: false,
    viewerCanReportToMaintainer: false,
    viewerCanSeeDeleteButton: false,
    viewerCanSeeMinimizeButton: false,
    viewerCanSeeUnminimizeButton: false,
    viewerCanUnblockFromOrg: false,
    viewerCanUpdate: false,
    viewerCannotUpdateReasons: [],
    viewerDidAuthor: true,
    viewerRelationship: 'OWNER',
  }),
  getEventNode('LabeledEvent', {
    createdAt: formatISO(subDays(today, 2)),
    actor: mockUsers.andrefcdias,
    label: {
      color: '3B0962',
      nameHTML: 'medium',
    },
  }),
  getEventNode('LabeledEvent', {
    createdAt: formatISO(subDays(today, 2)),
    actor: mockUsers.andrefcdias,
    label: {
      color: '62093E',
      nameHTML: 'error',
    },
  }),
  getEventNode('UnlabeledEvent', {
    createdAt: formatISO(subDays(today, 2)),
    actor: mockUsers.andrefcdias,
    label: {
      color: '366209',
      nameHTML: 'simple',
    },
  }),
  getEventNode('ClosedEvent', {
    createdAt: formatISO(subDays(today, 2)),
    actor: mockUsers.monalisa,
    closer: null,
    stateReason: 'COMPLETED',
    url: 'closed_event_url',
  }),
  getEventNode('ReopenedEvent', {
    createdAt: formatISO(subDays(today, 2)),
    actor: mockUsers.monalisa,
  }),
  getEventNode('DemilestonedEvent', {
    createdAt: formatISO(subDays(today, 2)),
    actor: mockUsers.andrefcdias,
    milestoneTitle: 'M2',
    milestone: {
      url: 'milestone_url',
    },
  }),
  getEventNode('MentionedEvent', {
    createdAt: formatISO(subDays(today, 2)),
    actor: mockUsers.hubot,
  }),
  getEventNode('RenamedTitleEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.hubot,
    currentTitle: 'Hero site - Development Alpha 3',
    previousTitle: 'Hero site - Development Alpha 2',
  }),
]

export const TimelineExample = getTimelineExample(mockRealisticNodes)

const mockAllEventNodes = [
  getEventNode('AddedToProjectEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    project: {
      name: 'Classic Project',
      url: 'project_x_url',
    },
    projectColumnName: 'To do',
  }),
  getEventNode('AddedToProjectV2Event', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    project: {
      title: 'Memex Project',
      url: 'project_x_url',
    },
  }),
  getEventNode('AssignedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    assignee: mockUsers.andrefcdias,
  }),
  getEventNode('AssignedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    assignee: mockUsers.monalisa,
  }),
  getEventNode('ClosedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    stateReason: 'COMPLETED',
    closer: null,
  }),
  getEventNode('ClosedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    stateReason: 'COMPLETED',
    closer: {
      __typename: 'PullRequest',
      url: 'closer_pr_url',
      number: 619,
      repository: mockRepositories.base,
    },
  }),
  getEventNode('ClosedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    stateReason: 'COMPLETED',
    closer: {
      __typename: 'Commit',
      url: 'closer_commit_url',
      abbreviatedOid: '4c421a4',
      repository: mockRepositories.base,
    },
  }),
  getEventNode('ClosedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    stateReason: 'NOT_PLANNED',
    closer: null,
  }),
  getEventNode('CommentDeletedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    deletedCommentAuthor: mockUsers.hubot,
  }),
  getEventNode('ConnectedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    subject: {
      title: 'Draft PR',
      url: 'connected_pr_url',
      number: 1,
      state: 'OPEN',
      isDraft: true,
      isInMergeQueue: false,
      repository: mockRepositories.base,
    },
  }),
  getEventNode('ConnectedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    subject: {
      title: 'Open PR',
      url: 'connected_pr_url',
      number: 1,
      state: 'OPEN',
      isDraft: false,
      isInMergeQueue: false,
      repository: mockRepositories.base,
    },
  }),
  getEventNode('ConnectedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    subject: {
      title: 'Completed in merge queue PR',
      url: 'connected_pr_url',
      number: 1,
      state: 'CLOSED',
      isDraft: false,
      isInMergeQueue: true,
      repository: mockRepositories.base,
    },
  }),
  getEventNode('ConnectedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    subject: {
      title: 'Merged PR',
      url: 'connected_pr_url',
      number: 1,
      state: 'MERGED',
      isDraft: false,
      isInMergeQueue: false,
      repository: mockRepositories.base,
    },
  }),
  getEventNode('ConnectedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    subject: {
      title: 'Closed PR',
      url: 'connected_pr_url',
      number: 1,
      state: 'CLOSED',
      isDraft: false,
      isInMergeQueue: false,
      repository: mockRepositories.base,
    },
  }),
  getEventNode('ConvertedFromDraftEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
  }),
  getEventNode('ConvertedNoteToIssueEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    project: {
      url: 'project_url',
      name: 'Memex Project',
    },
  }),
  getEventNode('ConvertedToDiscussionEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    discussion: {
      url: 'discussion_url',
      number: 1,
    },
  }),
  getEventNode('CrossReferencedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    referencedAt: formatISO(today),
    willCloseTarget: false,
    target: {
      repository: mockRepositories.base,
    },
    source: {
      __typename: 'Issue',
      databaseId: 1,
      title: 'Internal closed issue',
      url: 'issue_url',
      number: 1,
      stateReason: 'CLOSED',
      repository: mockRepositories.base,
    },
  }),
  getEventNode('CrossReferencedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    referencedAt: formatISO(today),
    willCloseTarget: false,
    target: {
      repository: mockRepositories.base,
    },
    source: {
      __typename: 'PullRequest',
      issueDatabaseId: 1,
      title: 'Internal closed PR',
      url: '',
      number: 1,
      state: 'CLOSED',
      isDraft: false,
      isInMergeQueue: false,
      repository: mockRepositories.base,
    },
  }),
  getEventNode('CrossReferencedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    referencedAt: formatISO(today),
    willCloseTarget: false,
    target: {
      repository: mockRepositories.base,
    },
    source: {
      __typename: 'Issue',
      databaseId: 1,
      title: 'External open issue',
      url: 'issue_url',
      number: 1,
      stateReason: 'OPEN',
      repository: mockRepositories.public,
    },
  }),
  getEventNode('CrossReferencedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    referencedAt: formatISO(today),
    willCloseTarget: false,
    target: {
      repository: mockRepositories.base,
    },
    source: {
      __typename: 'PullRequest',
      issueDatabaseId: 1,
      title: 'External open PR',
      url: 'pr_url',
      number: 1,
      state: 'OPEN',
      isDraft: false,
      isInMergeQueue: false,
      repository: mockRepositories.public,
    },
  }),
  getEventNode('CrossReferencedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    referencedAt: formatISO(today),
    willCloseTarget: false,
    target: {
      repository: mockRepositories.base,
    },
    source: {
      __typename: 'PullRequest',
      issueDatabaseId: 1,
      title: 'External draft PR, private repo',
      url: '',
      number: 1,
      state: 'OPEN',
      isDraft: true,
      isInMergeQueue: false,
      repository: mockRepositories.private,
    },
  }),
  getEventNode('DemilestonedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    milestoneTitle: 'Milestone 1',
    milestone: {
      url: 'milestone_url',
    },
  }),
  getEventNode('DisconnectedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    subject: {
      title: 'Open PR',
      url: 'pr_url',
      number: 1,
      state: 'OPEN',
      isDraft: false,
      isInMergeQueue: false,
      repository: mockRepositories.base,
    },
  }),
  // Graceful degradation - FallbackEvent.tsx
  {node: null},
  getEventNode('LabeledEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    label: {
      nameHTML: 'label 1',
      name: 'label 1',
      color: '123123',
      id: '12333',
      repository: mockRepositories.base,
    },
  }),
  getEventNode('LockedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    lockReason: 'OFF_TOPIC',
  }),
  getEventNode('LockedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    lockReason: 'RESOLVED',
  }),
  getEventNode('LockedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    lockReason: 'SPAM',
  }),
  getEventNode('LockedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    lockReason: 'TOO_HEATED',
  }),
  getEventNode('MarkedAsDuplicateEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    canonical: {
      url: 'duplicate_url',
      number: 999,
    },
  }),
  getEventNode('MentionedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
  }),
  getEventNode('MilestonedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    milestoneTitle: 'Milestone 1',
    milestone: {
      url: 'milestone_url',
    },
  }),
  getEventNode('MovedColumnsInProjectEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    project: {
      name: 'Classic Project',
      url: 'project_url',
    },
    previousProjectColumnName: 'To Do',
    projectColumnName: 'In Progress',
  }),
  getEventNode('PinnedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
  }),
  getEventNode('ProjectV2ItemStatusChangedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    project: {
      title: 'Memex Project',
      url: 'project_url',
    },
    previousStatus: 'To Do',
    status: 'In Progress',
  }),
  getEventNode('ReferencedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    commit: {
      message: 'Will fix the world',
      messageHeadlineHTML: 'Will fix the world',
      messageBodyHTML: null,
      url: 'commit_url',
      abbreviatedOid: '4c421a4',
      signature: {
        __typename: 'GitSignature',
        isValid: true,
        signer: mockUsers.andrefcdias,
        state: 'VALID',
        wasSignedByGitHub: true,
        issuer: {
          commonName: 'SmimeSignature',
          emailAddress: 'andre@dias.pt',
          organization: 'github',
          organizationUnit: 'github',
        },
        subject: {
          commonName: 'dias',
          emailAddress: 'andre@dias.pt',
          organization: 'github',
          organizationUnit: 'github',
        },
      },
      verificationStatus: 'VERIFIED',
      hasSignature: true,
      repository: mockRepositories.base,
    },
  }),
  getEventNode('ReferencedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    commit: {
      message: 'Super secure commit',
      messageHeadlineHTML: 'Super secure commit',
      messageBodyHTML: 'Just trust me',
      url: 'commit_url',
      abbreviatedOid: '1d4c421',
      signature: {
        __typename: 'GitSignature',
        isValid: false,
        signer: mockUsers.andrefcdias,
        state: 'BAD_EMAIL',
        wasSignedByGitHub: true,
        keyId: 'GpgSignature',
      },
      verificationStatus: 'PARTIALLY_VERIFIED',
      hasSignature: true,
      repository: mockRepositories.base,
    },
  }),
  getEventNode('ReferencedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    commit: {
      message: 'Totally legit',
      messageHeadlineHTML: 'Totally legit',
      messageBodyHTML: null,
      url: 'commit_url',
      abbreviatedOid: 'legitco',
      signature: {
        __typename: 'GitSignature',
        isValid: false,
        signer: mockUsers.andrefcdias,
        state: 'UNVERIFIED',
        wasSignedByGitHub: false,
        keyFingerprint: 'SshSignature',
      },
      verificationStatus: 'UNVERIFIED',
      hasSignature: false,
      repository: mockRepositories.base,
    },
  }),
  getEventNode('RemovedFromProjectEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    project: {
      name: 'Classic Project',
      url: 'project_url',
    },
    projectColumnName: 'Important',
  }),
  getEventNode('RemovedFromProjectV2Event', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    project: {
      title: 'Memex Project',
      url: 'project_url',
    },
  }),
  getEventNode('RenamedTitleEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    currentTitle: 'New and shiny title',
    previousTitle: 'Old ugly title',
  }),
  getEventNode('ReopenedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
  }),
  getEventNode('SubscribedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
  }),
  getEventNode('TransferredEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    fromRepository: mockRepositories.private,
  }),
  getEventNode('UnassignedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    assignee: mockUsers.hubot,
  }),
  getEventNode('UnlabeledEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    label: {
      nameHTML: 'label 1',
      name: 'label 1',
      color: '123123',
      id: '12333',
      repository: mockRepositories.base,
    },
  }),
  getEventNode('UnlockedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
  }),
  getEventNode('UnmarkedAsDuplicateEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    canonical: {
      url: 'duplicate_url',
      number: 999,
    },
  }),
  getEventNode('UnpinnedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
  }),
  getEventNode('UnsubscribedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
  }),
  getEventNode('UserBlockedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    blockDuration: 'ONE_MONTH',
    blockedUser: mockUsers.monalisa,
  }),
  getEventNode('UserBlockedEvent', {
    createdAt: formatISO(today),
    actor: mockUsers.andrefcdias,
    blockDuration: 'PERMANENT',
    blockedUser: mockUsers.hubot,
  }),
]

export const TimelineWithAllEventTypes = getTimelineExample(mockAllEventNodes)
