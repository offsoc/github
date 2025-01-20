import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {
  buildCandidateReviewer,
  buildCodeowner,
  buildOnBehalfOfReviewer,
  buildPullRequest,
  buildReview,
  buildReviewRequest,
  buildSuggestedReviewer,
} from '../../../test-utils/query-data'
import {ReviewersTestComponent as TestComponent} from '../ReviewersTestComponent'

test('renders the requested reviewers', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            state: 'CLOSED',
            viewerCanUpdate: false,
            reviewRequests: [
              buildReviewRequest({login: 'monalisa', assignedFromTeam: 'Team1'}),
              buildReviewRequest({login: 'Team1', isTeam: true}),
            ],
          })
        },
      }),
    )
  })

  expect(screen.getByText('monalisa')).toBeInTheDocument()
  expect(screen.getByText('Team1')).toBeInTheDocument()
  expect(screen.queryByLabelText('Cancel review request to ${requestedReviewer.name}')).not.toBeInTheDocument()
})

test('renders the requested reviewers with delete button when viewer can edit', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            state: 'OPEN',
            viewerCanUpdate: true,
            reviewRequests: [
              buildReviewRequest({login: 'monalisa', assignedFromTeam: 'Team1'}),
              buildReviewRequest({login: 'Team1', isTeam: true}),
            ],
          })
        },
      }),
    )
  })

  expect(screen.getByText('monalisa')).toBeInTheDocument()
  expect(screen.getByText('Team1')).toBeInTheDocument()
  expect(screen.getByLabelText('Cancel review request to monalisa')).toBeInTheDocument()
  expect(screen.getByLabelText('Cancel review request to Team1')).toBeInTheDocument()
})

test('renders the requested reviewers assigned from codeowners', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            state: 'OPEN',
            viewerCanUpdate: false,
            reviewRequests: [
              buildReviewRequest({login: 'monalisa', isCodeowner: true}),
              buildReviewRequest({
                login: 'mona',
                assignedFromTeam: 'Team1',
                assignedFromTeamIsCodeowner: true,
              }),
              buildReviewRequest({login: 'Team1', isTeam: true, isCodeowner: true}),
            ],
          })
        },
      }),
    )
  })

  expect(screen.getByLabelText('monalisa is a codeowner')).toBeInTheDocument()
  expect(screen.getByLabelText('Team1 is a codeowner')).toBeInTheDocument()
  expect(screen.getByLabelText('mona is a codeowner assigned automatically on behalf of Team1')).toBeInTheDocument()
})

test('does not show the reviewers picker if the PR is not open', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            state: 'CLOSED',
            viewerCanUpdate: true,
          })
        },
      }),
    )
  })
  expect(screen.queryByRole('button', {name: 'Edit Reviewers'})).not.toBeInTheDocument()
})

test('does not show the reviewers picker if the viewer cannot update', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            state: 'OPEN',
            viewerCanUpdate: false,
          })
        },
      }),
    )
  })
  expect(screen.queryByRole('button', {name: 'Edit Reviewers'})).not.toBeInTheDocument()
})

test('shows the reviewers picker if the PR is open and viewer can update', async () => {
  const environment = createMockEnvironment()
  const pullRequest = buildPullRequest({
    state: 'OPEN',
    viewerCanUpdate: true,
    candidateReviewers: [buildCandidateReviewer({name: 'octocat1', kind: 'User'})],
    suggestedReviewers: [buildSuggestedReviewer({login: 'suggestedReviewer', role: 'commenter'})],
  })

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return pullRequest
        },
      }),
    )
  })
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return pullRequest
        },
      }),
    )
  })

  expect(screen.getByRole('button', {name: 'Edit Reviewers'})).toBeInTheDocument()
})

test('renders the "Approved" text when the reviewer state is APPROVED', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            latestReviews: [buildReview({avatarUrl: '', login: 'suggestedReviewer', url: '', state: 'APPROVED'})],
          })
        },
      }),
    )
  })
  expect(screen.getByText('Approved')).toBeInTheDocument()
})

test('renders the "Awaiting review" text when the reviewer state is PENDING', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            latestReviews: [buildReview({avatarUrl: '', login: 'suggestedReviewer', url: '', state: 'PENDING'})],
          })
        },
      }),
    )
  })
  expect(screen.getByText('Awaiting review')).toBeInTheDocument()
})

test('renders the "Requested changes" text when the reviewer state is CHANGES_REQUESTED', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            latestReviews: [
              buildReview({avatarUrl: '', login: 'suggestedReviewer', url: '', state: 'CHANGES_REQUESTED'}),
            ],
          })
        },
      }),
    )
  })
  expect(screen.getByText('Requested changes')).toBeInTheDocument()
})

test('renders the "Commented" text when the reviewer state is COMMENTED', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            latestReviews: [buildReview({avatarUrl: '', login: 'suggestedReviewer', url: '', state: 'COMMENTED'})],
          })
        },
      }),
    )
  })
  expect(screen.getByText('Commented')).toBeInTheDocument()
})

test('reviewers to be auto assigned are shown with a badge and an icon', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            reviewRequests: [
              buildReviewRequest({login: 'monalisa'}),
              buildReviewRequest({login: 'Team1', isTeam: true}),
            ],
            codeowners: [buildCodeowner({name: 'mona', kind: 'User'}), buildCodeowner({name: 'github', kind: 'Team'})],
            isDraft: true,
            viewerCanUpdate: false,
          })
        },
      }),
    )
  })
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            reviewRequests: [
              buildReviewRequest({login: 'monalisa'}),
              buildReviewRequest({login: 'Team1', isTeam: true}),
            ],
            codeowners: [buildCodeowner({name: 'mona', kind: 'User'}), buildCodeowner({name: 'github', kind: 'Team'})],
            isDraft: true,
            viewerCanUpdate: false,
          })
        },
      }),
    )
  })

  expect(screen.getByText('mona')).toBeInTheDocument()
  expect(screen.getByText('github')).toBeInTheDocument()
  expect(screen.getByLabelText('mona is a codeowner')).toBeInTheDocument()
  expect(screen.getByLabelText('github is a codeowner')).toBeInTheDocument()
  const autoAssignIcons = screen.getAllByLabelText('To be requested once ready for review')
  expect(autoAssignIcons[0]).toBeInTheDocument()
  expect(autoAssignIcons[1]).toBeInTheDocument()
})

test('reviewers to be auto assigned excludes requested reviewers', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            reviewRequests: [buildReviewRequest({id: 'mona-id', login: 'mona'})],
            codeowners: [buildCodeowner({id: 'mona-id', name: 'mona', kind: 'User'})],
            isDraft: true,
            viewerCanUpdate: false,
          })
        },
      }),
    )
  })
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            reviewRequests: [buildReviewRequest({id: 'mona-id', login: 'mona'})],
            codeowners: [buildCodeowner({id: 'mona-id', name: 'mona', kind: 'User'})],
            isDraft: true,
            viewerCanUpdate: false,
          })
        },
      }),
    )
  })

  expect(screen.getByText('mona')).toBeInTheDocument()
  const autoAssignIcons = screen.queryAllByLabelText('To be requested once ready for review')
  expect(autoAssignIcons.length).toBe(0)
})

test('reviewers to be auto assigned excludes reviewers', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            latestReviews: [buildReview({login: 'mona', url: '', state: 'APPROVED'})],
            codeowners: [buildCodeowner({name: 'mona', kind: 'User'})],
            isDraft: true,
            viewerCanUpdate: false,
          })
        },
      }),
    )
  })
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            latestReviews: [buildReview({login: 'mona', url: '', state: 'APPROVED'})],
            codeowners: [buildCodeowner({name: 'mona', kind: 'User'})],
            isDraft: true,
            viewerCanUpdate: false,
          })
        },
      }),
    )
  })

  expect(screen.getByText('mona')).toBeInTheDocument()
  const autoAssignIcons = screen.queryAllByLabelText('To be requested once ready for review')
  expect(autoAssignIcons.length).toBe(0)
})

test('suggested reviewer renders a button to request review', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest()
        },
      }),
    )
  })
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            state: 'OPEN',
            suggestedReviewers: [buildSuggestedReviewer({login: 'suggestedReviewer1'})],
            viewerCanUpdate: true,
          })
        },
      }),
    )
  })

  expect(screen.getByText('suggestedReviewer1')).toBeInTheDocument()
  const requestButton = screen.getByRole('button', {name: 'Request'})

  act(() => {
    requestButton.click()
  })
  expect(requestButton).toBeDisabled()
})

test('suggest reviewer request button is re-enabled if requesting reviewer fails', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest()
        },
      }),
    )
  })
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            state: 'OPEN',
            suggestedReviewers: [buildSuggestedReviewer({login: 'suggestedReviewer1'})],
            viewerCanUpdate: true,
          })
        },
      }),
    )
  })

  expect(screen.getByText('suggestedReviewer1')).toBeInTheDocument()
  const requestButton = screen.getByRole('button', {name: 'Request'})

  act(() => {
    requestButton.click()
  })
  expect(requestButton).toBeDisabled()

  // mock the mutation to request review
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.rejectMostRecentOperation(() => new Error('whoops!'))
  })

  expect(requestButton).not.toBeDisabled()
})

test('reviewer empty state shows the proper text', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest()
        },
      }),
    )
  })
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest()
        },
      }),
    )
  })

  expect(screen.getByText('None')).toBeInTheDocument()
})

test('the tooltip renders the "Assigned from" text when the reviewer was auto-assigned from a team review request', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            reviewRequests: [buildReviewRequest({login: 'suggestedReviewer', assignedFromTeam: 'Team1'})],
          })
        },
      }),
    )
  })

  expect(screen.getByLabelText('Assigned from Team1')).toBeInTheDocument()
})

test('the tooltip renders the "On behalf of" text when the reviewer belongs to multiple teams', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            latestReviews: [
              buildReview({
                avatarUrl: '',
                login: 'suggestedReviewer',
                onBehalfOfReviewers: [
                  buildOnBehalfOfReviewer({name: 'Team1'}),
                  buildOnBehalfOfReviewer({name: 'Team2'}),
                  buildOnBehalfOfReviewer({name: 'Team3'}),
                ],
                url: '',
                state: 'COMMENTED',
              }),
            ],
          })
        },
      }),
    )
  })
  expect(screen.getByLabelText('On behalf of Team1, Team2, Team3')).toBeInTheDocument()
})

test('the tooltip renders the "On behalf of" text when the reviewer belongs to a single teamm', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            latestReviews: [
              buildReview({
                avatarUrl: '',
                login: 'suggestedReviewer',
                onBehalfOfReviewers: [buildOnBehalfOfReviewer({name: 'Team1'})],
                url: '',
                state: 'COMMENTED',
              }),
            ],
          })
        },
      }),
    )
  })
  expect(screen.getByLabelText('On behalf of Team1')).toBeInTheDocument()
})

test('renders the codeowner badge when the reviewer left a review as a codeowner on behalf of a team', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            latestReviews: [
              buildReview({
                avatarUrl: '',
                login: 'monalisa',
                url: '',
                state: 'APPROVED',
                onBehalfOfReviewers: [buildOnBehalfOfReviewer({asCodeowner: true, name: 'github/pull-requests'})],
              }),
            ],
          })
        },
      }),
    )
  })

  expect(
    screen.getByLabelText('monalisa left a review as a codeowner on behalf of github/pull-requests'),
  ).toBeInTheDocument()
})

test('renders the codeowner badge when the reviewer is a codeowner', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            latestReviews: [
              buildReview({
                avatarUrl: '',
                login: 'monalisa',
                url: '',
                state: 'APPROVED',
                onBehalfOfReviewers: [buildOnBehalfOfReviewer({asCodeowner: true, kind: 'User', name: 'monalisa'})],
              }),
            ],
          })
        },
      }),
    )
  })

  expect(screen.getByLabelText('monalisa is a codeowner')).toBeInTheDocument()
})
