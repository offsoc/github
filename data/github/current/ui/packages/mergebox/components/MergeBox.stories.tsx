import type {ArgTypes, Meta, StoryObj} from '@storybook/react'
import {delay, http, HttpResponse} from '@github-ui/storybook/msw'
import {MemoryRouter} from 'react-router-dom'
import {createMockEnvironment} from 'relay-test-utils'
import {AppContext} from '@github-ui/react-core/app-context'
import {jsonRoute} from '@github-ui/react-core/json-route'
import {createBrowserHistory} from '@github-ui/react-core/create-browser-history'
import {QueryClientProvider} from '@tanstack/react-query'
import queryClient from '@github-ui/pull-request-page-data-tooling/query-client'
import {PageData} from '@github-ui/pull-request-page-data-tooling/page-data'
import {BASE_PAGE_DATA_URL, MergeBoxTestComponent as MergeBoxComponent} from '../test-utils/MergeBoxTestComponent'

import {
  buildReview,
  conflictsSectionCleanMergeState,
  conflictsSectionPendingMergeState,
  conflictsSectionStandardConflictsMergeState,
  defaultPullRequest,
  defaultCommitAuthorData,
  wrapListAsEdges,
} from '../test-utils/query-data'
import {
  checksSectionPendingState,
  checksSectionPendingWithFailureState,
  checksSectionPassingState,
  checksSectionSomeFailedState,
  checksSectionFailedState,
} from '../test-utils/mocks/checks-section-mocks'
import type {RelayPullRequest} from '../types'

const statusChecksPageDataRoute = `${BASE_PAGE_DATA_URL}/page_data/${PageData.statusChecks}`

const defaultViewer = {
  login: 'monalisa',
}

const argTypes: ArgTypes = {
  environment: {table: {disable: true}},
  hideIcon: {control: {type: 'boolean'}},
}

const meta: Meta<typeof MergeBoxComponent> = {
  title: 'Pull Requests/mergebox/MergeBox',
  component: MergeBoxComponent,
  args: {
    hideIcon: false,
    environment: createMockEnvironment(),
    viewer: defaultViewer,
  },
  argTypes,
  decorators: [
    Story => {
      // Resets the Tanstack Query Client Cache between stroies to ensure that we don't use stale data.
      queryClient.clear()

      return (
        <MemoryRouter>
          <AppContext.Provider
            value={{
              routes: [jsonRoute({path: '/a', Component: () => null})],
              history: createBrowserHistory(),
            }}
          >
            <QueryClientProvider client={queryClient}>
              <div style={{maxWidth: '1000px', marginLeft: '50px'}}>
                <Story />
              </div>
            </QueryClientProvider>
          </AppContext.Provider>
        </MemoryRouter>
      )
    },
  ],
}

type Story = StoryObj<typeof MergeBoxComponent>

export const readyToMerge: Story = (function () {
  const pullRequest: RelayPullRequest = {
    ...defaultPullRequest,
    latestOpinionatedReviews: wrapListAsEdges([
      buildReview({
        authorCanPushToRepository: true,
        login: 'octocat',
        onBehalfOfReviewers: [
          {
            name: 'some-team-reviewers',
          },
        ],
        state: 'APPROVED',
      }),
      buildReview({
        authorCanPushToRepository: true,
        login: 'monalisa',
        onBehalfOfReviewers: [
          {
            name: 'hubbers',
          },
        ],
        state: 'COMMENTED',
      }),
      buildReview({
        authorCanPushToRepository: true,
        login: 'thor',
        onBehalfOfReviewers: [
          {
            name: 'the-avengers',
          },
        ],
        state: 'CHANGES_REQUESTED',
      }),
    ]),
    ...conflictsSectionCleanMergeState,
  }
  return {
    argTypes,
    args: {
      pullRequest,
    },
    parameters: {
      msw: {
        handlers: [
          http.get(statusChecksPageDataRoute, () => {
            return HttpResponse.json(checksSectionPassingState)
          }),
        ],
      },
    },
    render: args => <MergeBoxComponent {...args} />,
  }
})()

export const reviewsRequiredAndApprovingReviews: Story = (function () {
  const pullRequest: RelayPullRequest = {
    ...defaultPullRequest,
    mergeStateStatus: 'CLEAN',
    mergeRequirements: {
      ...defaultCommitAuthorData,
      state: 'MERGEABLE',
      conditions: [
        {
          __typename: 'PullRequestRulesCondition',
          result: 'PASSED',
          message: '',
          ruleRollups: [
            {
              failureReasons: [],
              message: '',
              requiredReviewers: 1,
              requiresCodeowners: false,
              result: 'PASSED',
              ruleType: 'PULL_REQUEST',
            },
          ],
        },
        {
          __typename: 'PullRequestMergeConflictStateCondition',
          conflicts: [],
          isConflictResolvableInWeb: true,
          result: 'PASSED',
          message: '',
        },
      ],
    },
    latestOpinionatedReviews: wrapListAsEdges([
      buildReview({
        authorCanPushToRepository: true,
        login: 'octocat',
        onBehalfOfReviewers: [
          {
            name: 'some-team-reviewers',
          },
        ],
        state: 'APPROVED',
      }),
    ]),
  }

  return {
    argTypes,
    args: {
      pullRequest,
    },
    parameters: {
      msw: {
        handlers: [
          http.get(statusChecksPageDataRoute, () => {
            return HttpResponse.json(checksSectionPassingState)
          }),
        ],
      },
    },
    render: args => <MergeBoxComponent {...args} />,
  }
})()

export const changesRequested: Story = (function () {
  const pullRequest: RelayPullRequest = {
    ...defaultPullRequest,
    mergeRequirements: {
      ...defaultCommitAuthorData,
      state: 'UNMERGEABLE',
      conditions: [
        {
          __typename: 'PullRequestRulesCondition',
          result: 'FAILED',
          message: 'At least one approving review is required by reviewers with write access.',
          ruleRollups: [
            {
              failureReasons: ['CHANGES_REQUESTED'],
              message: 'At least one approving review is required by reviewers with write access.',
              requiredReviewers: 1,
              requiresCodeowners: false,
              result: 'FAILED',
              ruleType: 'PULL_REQUEST',
            },
          ],
        },
        {
          __typename: 'PullRequestMergeConflictStateCondition',
          conflicts: [],
          result: 'PASSED',
          message: null,
        },
      ],
    },
    latestOpinionatedReviews: wrapListAsEdges([
      buildReview({
        authorCanPushToRepository: true,
        login: 'octocat',
        onBehalfOfReviewers: [
          {
            name: 'some-team-reviewers',
          },
        ],
        state: 'APPROVED',
      }),
      buildReview({
        authorCanPushToRepository: true,
        login: 'octokitten',
        onBehalfOfReviewers: [
          {
            name: 'some-team-reviewers',
          },
        ],
        state: 'CHANGES_REQUESTED',
      }),
    ]),
  }

  return {
    argTypes,
    args: {
      pullRequest,
    },
    parameters: {
      msw: {
        handlers: [
          http.get(statusChecksPageDataRoute, () => {
            return HttpResponse.json(checksSectionPassingState)
          }),
        ],
      },
    },
    render: args => <MergeBoxComponent {...args} />,
  }
})()

export const pendingGitMergeStatus: Story = (function () {
  const pullRequest = {
    ...defaultPullRequest,
    latestOpinionatedReviews: wrapListAsEdges([
      buildReview({
        authorCanPushToRepository: true,
        login: 'octocat',
        onBehalfOfReviewers: [
          {
            name: 'some-team-reviewers',
          },
        ],
        state: 'APPROVED',
      }),
      buildReview({
        authorCanPushToRepository: true,
        login: 'octokitten',
        onBehalfOfReviewers: [
          {
            name: 'some-team-reviewers',
          },
        ],
        state: 'CHANGES_REQUESTED',
      }),
    ]),
    ...conflictsSectionPendingMergeState,
  }

  return {
    argTypes,
    args: {
      pullRequest,
    },
    parameters: {
      msw: {
        handlers: [
          http.get(statusChecksPageDataRoute, () => {
            return HttpResponse.json(checksSectionPassingState)
          }),
        ],
      },
    },
    render: args => <MergeBoxComponent {...args} />,
  }
})()

export const needReviewsAndFailedChecksHasConflicts: Story = (function () {
  const pullRequest = {...defaultPullRequest, ...conflictsSectionStandardConflictsMergeState}
  return {
    argTypes,
    args: {
      pullRequest,
    },
    render: args => <MergeBoxComponent {...args} />,
  }
})()

export const closed: Story = (function () {
  const pullRequest: RelayPullRequest = {
    ...defaultPullRequest,
    state: 'CLOSED',
    viewerCanDeleteHeadRef: true,
    viewerCanRestoreHeadRef: false,
  }

  return {
    argTypes,
    args: {
      pullRequest,
    },
    parameters: {
      msw: {
        handlers: [
          http.get(statusChecksPageDataRoute, () => {
            return HttpResponse.json(checksSectionPassingState)
          }),
        ],
      },
    },
    render: args => <MergeBoxComponent {...args} />,
  }
})()

export const merged: Story = (function () {
  const pullRequest: RelayPullRequest = {
    ...defaultPullRequest,
    state: 'MERGED',
    viewerCanDeleteHeadRef: true,
    viewerCanRestoreHeadRef: true,
  }

  return {
    argTypes,
    args: {
      pullRequest,
    },
    parameters: {
      msw: {
        handlers: [
          http.get(statusChecksPageDataRoute, () => {
            return HttpResponse.json(checksSectionPassingState)
          }),
        ],
      },
    },
    render: args => <MergeBoxComponent {...args} />,
  }
})()

export const queued: Story = (function () {
  const pullRequest: RelayPullRequest = {
    ...defaultPullRequest,
    isInMergeQueue: true,
    viewerCanAddAndRemoveFromMergeQueue: true,
    mergeQueueEntry: {
      position: 1,
      state: 'QUEUED',
    },
    mergeQueue: {
      url: 'http://github.localhost/monalisa/smile/queue',
    },
  }

  return {
    argTypes,
    args: {
      pullRequest,
    },
    parameters: {
      msw: {
        handlers: [
          http.get(statusChecksPageDataRoute, () => {
            return HttpResponse.json(checksSectionPassingState)
          }),
        ],
      },
    },
    render: args => <MergeBoxComponent {...args} />,
  }
})()

export const pendingAllChecks: Story = (function () {
  return {
    argTypes,
    args: {
      pullRequest: defaultPullRequest,
    },
    parameters: {
      msw: {
        handlers: [
          http.get(statusChecksPageDataRoute, () => {
            return HttpResponse.json(checksSectionPendingState)
          }),
        ],
      },
    },
    render: args => <MergeBoxComponent {...args} />,
  }
})()

export const failingAndPendingChecks: Story = (function () {
  return {
    argTypes,
    args: {
      pullRequest: defaultPullRequest,
    },
    parameters: {
      msw: {
        handlers: [
          http.get(statusChecksPageDataRoute, () => {
            return HttpResponse.json(checksSectionPendingWithFailureState)
          }),
        ],
      },
    },
    render: args => <MergeBoxComponent {...args} />,
  }
})()

export const passingAllChecks: Story = (function () {
  return {
    argTypes,
    args: {
      pullRequest: defaultPullRequest,
    },
    parameters: {
      msw: {
        handlers: [
          http.get(statusChecksPageDataRoute, () => {
            return HttpResponse.json(checksSectionPassingState)
          }),
        ],
      },
    },
    render: args => <MergeBoxComponent {...args} />,
  }
})()

export const failingSomeChecks: Story = (function () {
  return {
    argTypes,
    args: {
      pullRequest: defaultPullRequest,
    },
    parameters: {
      msw: {
        handlers: [
          http.get(statusChecksPageDataRoute, () => {
            return HttpResponse.json(checksSectionSomeFailedState)
          }),
        ],
      },
    },
    render: args => <MergeBoxComponent {...args} />,
  }
})()

export const failingAllChecks: Story = (function () {
  return {
    argTypes,
    args: {
      pullRequest: defaultPullRequest,
    },
    parameters: {
      msw: {
        handlers: [
          http.get(statusChecksPageDataRoute, () => {
            return HttpResponse.json(checksSectionFailedState)
          }),
        ],
      },
    },
    render: args => <MergeBoxComponent {...args} />,
  }
})()

export const failedToLoadChecks: Story = (function () {
  return {
    argTypes,
    args: {
      pullRequest: defaultPullRequest,
    },
    parameters: {
      msw: {
        handlers: [
          http.get(statusChecksPageDataRoute, () => {
            return HttpResponse.json(null, {status: 403})
          }),
        ],
      },
    },
    render: args => <MergeBoxComponent {...args} />,
  }
})()

export const loadingChecks: Story = (function () {
  return {
    argTypes,
    args: {
      pullRequest: defaultPullRequest,
    },
    parameters: {
      msw: {
        handlers: [
          http.get(statusChecksPageDataRoute, async () => {
            await delay('infinite')
            return HttpResponse.json(checksSectionPendingState)
          }),
        ],
      },
    },
    render: args => <MergeBoxComponent {...args} />,
  }
})()

export default meta
