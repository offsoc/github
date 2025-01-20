import {SectionHeader} from '@github-ui/issue-metadata/SectionHeader'
import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import type {ReviewersPickerTestQuery} from '../__tests__/__generated__/ReviewersPickerTestQuery.graphql'
import {LazyReviewerPicker, ReviewerPickerBase} from '../ReviewersPicker'

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
}

function TestComponent(componentProps: TestComponentProps) {
  const TestComponentWithQuery = () => {
    const data = useLazyLoadQuery<ReviewersPickerTestQuery>(
      graphql`
        query ReviewersPickerTestQuery @relay_test_operation {
          pullRequest: node(id: "test-id") {
            ... on PullRequest {
              ...ReviewersPickerSuggestedReviewers_pullRequest
              ...ReviewersPickerCandidateReviewers_pullRequest
            }
          }
        }
      `,
      {},
    )
    if (!data.pullRequest) {
      return null
    }

    // Test the base component because the outer component loads data, which is difficult to test with Relay
    return (
      <ReviewerPickerBase
        anchorElement={props => <SectionHeader buttonProps={props} headingProps={{as: 'h4'}} title="Reviewers" />}
        assignedReviewerIds={[]}
        isLoading={false}
        isRequestingReviews={false}
        pullRequestCandidateReviewers={data.pullRequest}
        pullRequestId="mock"
        pullRequestSuggestedReviewers={data.pullRequest}
        onSelectionChange={noop}
      />
    )
  }

  return (
    <PullRequestsAppWrapper environment={componentProps.environment} pullRequestId={'mock'}>
      <TestComponentWithQuery />
    </PullRequestsAppWrapper>
  )
}

test('renders candidate reviewers as flat list when there are no suggested reviewers', async () => {
  const environment = createMockEnvironment()

  const {user} = render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return {
            candidateReviewers: {
              edges: [
                {
                  node: {
                    reviewer: {
                      __typename: 'User',
                      avatarUrl: 'mock-url',
                      id: 'octocat1',
                      login: 'octocat1',
                      name: 'Octo Cat',
                    },
                  },
                },
              ],
            },
          }
        },
      }),
    )
  })
  const button = screen.getByRole('button', {name: 'Edit Reviewers'})
  await user.click(button)

  expect(await screen.findByText('octocat1')).toBeVisible()
  expect(await screen.findByText('Octo Cat')).toBeVisible()
})

test('renders candidate reviewers and suggested reviewers who recently edited the files', async () => {
  const environment = createMockEnvironment()

  const {user} = render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return {
            candidateReviewers: {
              edges: [
                {
                  node: {
                    reviewer: {
                      __typename: 'User',
                      avatarUrl: 'mock-url',
                      id: 'octocat1',
                      login: 'octocat1',
                      name: 'Octo Cat',
                    },
                  },
                },
              ],
            },
            suggestedReviewers: [
              {
                isAuthor: true,
                isCommenter: false,
                reviewer: {
                  __typename: 'User',
                  avatarUrl: 'mock-url',
                  id: 'suggestedReviewer',
                  login: 'suggestedReviewer',
                  name: 'Suggested Reviewer',
                },
              },
            ],
          }
        },
      }),
    )
  })
  const button = screen.getByRole('button', {name: 'Edit Reviewers'})
  await user.click(button)

  expect(await screen.findByText('octocat1')).toBeVisible()
  expect(screen.getByText('Octo Cat')).toBeVisible()

  expect(screen.getByText('suggestedReviewer')).toBeVisible()
  expect(screen.getByText('Suggested Reviewer')).toBeVisible()
  expect(screen.getByText('Recently edited these files')).toBeVisible()
})

test('renders candidate reviewers and suggested reviewers who recently reviewed the files', async () => {
  const environment = createMockEnvironment()

  const {user} = render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return {
            candidateReviewers: {
              edges: [
                {
                  node: {
                    reviewer: {
                      __typename: 'User',
                      avatarUrl: 'mock-url',
                      id: 'octocat1',
                      login: 'octocat1',
                      name: 'Octo Cat',
                    },
                  },
                },
              ],
            },
            suggestedReviewers: [
              {
                isAuthor: false,
                isCommenter: true,
                reviewer: {
                  __typename: 'User',
                  avatarUrl: 'mock-url',
                  id: 'suggestedReviewer',
                  login: 'suggestedReviewer',
                  name: 'Suggested Reviewer',
                },
              },
            ],
          }
        },
      }),
    )
  })
  const button = screen.getByRole('button', {name: 'Edit Reviewers'})
  await user.click(button)

  expect(await screen.findByText('octocat1')).toBeVisible()
  expect(screen.getByText('Octo Cat')).toBeVisible()

  expect(screen.getByText('suggestedReviewer')).toBeVisible()
  expect(screen.getByText('Suggested Reviewer')).toBeVisible()
  expect(screen.getByText('Recently reviewed these files')).toBeVisible()
})

describe('LazyReviewerPicker', () => {
  test('does not load reviewer picker data until clicked', async () => {
    const environment = createMockEnvironment()
    const {user} = render(
      <PullRequestsAppWrapper environment={environment} pullRequestId={'mock'}>
        <LazyReviewerPicker
          anchorElement={props => <SectionHeader buttonProps={props} headingProps={{as: 'h4'}} title="Reviewers" />}
          assignedReviewerIds={[]}
          isRequestingReviews={false}
          pullRequestId="mock"
          onUpdateRequestedReviewers={noop}
        />
      </PullRequestsAppWrapper>,
    )

    const pickerButton = screen.getByRole('button', {name: 'Edit Reviewers'})

    // the picker button is visible without any query data being available
    expect(pickerButton).toBeVisible()

    // click the button and confirm that queries were fired to load query data
    await user.click(pickerButton)

    const operations = environment.mock.getAllOperations()
    const searchQuery = operations[1]
    const suggestionsQuery = operations[0]
    expect(searchQuery?.fragment.node.name).toBe('ReviewersPickerSearchQuery')
    expect(suggestionsQuery?.fragment.node.name).toBe('ReviewersPickerSuggestionsQuery')
  })
})
