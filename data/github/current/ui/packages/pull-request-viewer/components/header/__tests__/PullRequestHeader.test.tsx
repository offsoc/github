import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {render} from '@github-ui/react-core/test-utils'
import {SearchIndex} from '@github-ui/ref-selector/search-index'
import {act, screen, waitFor, within} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import {buildPullRequest, buildViewer} from '../../../test-utils/query-data'
import type {PullRequestsTargetType} from '../../../types/analytics-events-types'
import {PullRequestHeader} from '../PullRequestHeaderWrapper'
import type {PullRequestHeaderTestQuery} from './__generated__/PullRequestHeaderTestQuery.graphql'

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
}

const pullRequestId = 'PR_kwAEAg'

function TestComponent({environment}: TestComponentProps) {
  const HeaderWithRelayQuery = () => {
    const data = useLazyLoadQuery<PullRequestHeaderTestQuery>(
      graphql`
        query PullRequestHeaderTestQuery(
          $number: Int!
          $owner: String!
          $repo: String!
          $singleCommitOid: String
          $startOid: String
          $endOid: String
        ) {
          viewer {
            ...PullRequestHeaderWrapper_user
          }
          repository(owner: $owner, name: $repo) {
            ...PullRequestHeaderWrapper_repository
          }
        }
      `,
      {
        number: 0,
        owner: 'monalisa',
        repo: 'smile',
      },
    )

    if (data.repository) {
      return <PullRequestHeader refListCacheKey="" repository={data.repository} user={data.viewer} />
    }
    return null
  }
  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId={pullRequestId}>
      <HeaderWithRelayQuery />
    </PullRequestsAppWrapper>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => {
    return {owner: 'monalisa', repo: 'smile', number: '1'}
  },
}))

afterEach(() => {
  // restore the spy created with spyOn
  jest.restoreAllMocks()
})

test('it renders branch info', async () => {
  const environment = createMockEnvironment()
  const pullRequest = buildPullRequest({
    state: 'MERGED',
    mergedAt: '2020-01-01T00:00:00Z',
    viewerCanUpdate: true,
  })
  jest.useFakeTimers().setSystemTime(new Date('2022-09-09'))
  jest.spyOn(console, 'error').mockImplementationOnce(() => {})

  render(<TestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Repository() {
          return {pullRequest, isWritable: true, isFork: false}
        },
        User() {
          return buildViewer()
        },
      }),
    )
  })

  await screen.findByText('Merged')
  // escape hatching into data-testid because parent element contains a ton of text wrapped in various elements
  const headerBranchText = screen.getByTestId('files-page-header-branch-text')
  expect(headerBranchText.textContent).toMatch(
    `${pullRequest.author?.login} merged ${pullRequest.commits.totalCount} commit into ${pullRequest.baseRefName} from ${pullRequest.headRefName}`,
  )
})

test('renders header pull request label element as "Open" when GraphQL pullRequest.state is "OPEN"', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Repository() {
          return {pullRequest: buildPullRequest({state: 'OPEN', viewerCanUpdate: true})}
        },
        User() {
          return buildViewer()
        },
      }),
    )
  })

  await expect(screen.findByText('Open')).resolves.toBeInTheDocument()
})

describe('renders header pull request label element as "Draft" when', () => {
  test('pull request is open and is a draft', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          Repository() {
            return {
              pullRequest: buildPullRequest({isDraft: true, viewerCanUpdate: true, state: 'OPEN'}),
              isWritable: true,
            }
          },
          User() {
            return buildViewer()
          },
        }),
      )
    })

    await expect(screen.findByText('Draft')).resolves.toBeInTheDocument()
  })
})

describe('does not render header pull request label element as "Draft" when', () => {
  test('pull request is closed and was a draft', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          Repository() {
            return {
              pullRequest: buildPullRequest({isDraft: true, viewerCanUpdate: true, state: 'CLOSED'}),
              isWritable: true,
            }
          },
          User() {
            return buildViewer()
          },
        }),
      )
    })

    await expect(screen.findByText('Closed')).resolves.toBeInTheDocument()
    expect(screen.queryByText('Draft')).not.toBeInTheDocument()
  })

  test('pull request is open and not a draft', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          Repository() {
            return {
              pullRequest: buildPullRequest({isDraft: false, viewerCanUpdate: true, state: 'OPEN'}),
              isWritable: true,
            }
          },
          User() {
            return buildViewer()
          },
        }),
      )
    })

    await expect(screen.findByText('Open')).resolves.toBeInTheDocument()
    expect(screen.queryByText('Draft')).not.toBeInTheDocument()
  })

  test('pull request is in merge queue and a draft', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          Repository() {
            return {
              pullRequest: buildPullRequest({
                isDraft: true,
                isInMergeQueue: true,
                viewerCanUpdate: true,
                state: 'OPEN',
              }),
              isWritable: true,
            }
          },
          User() {
            return buildViewer()
          },
        }),
      )
    })

    await expect(screen.findByText('Queued')).resolves.toBeInTheDocument()
    expect(screen.queryByText('Draft')).not.toBeInTheDocument()
  })

  test('pull request is merged and in draft', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          Repository() {
            return {
              pullRequest: buildPullRequest({
                isDraft: true,
                viewerCanUpdate: true,
                state: 'MERGED',
              }),
              isWritable: true,
            }
          },
          User() {
            return buildViewer()
          },
        }),
      )
    })

    await expect(screen.findByText('Merged')).resolves.toBeInTheDocument()
    expect(screen.queryByText('Draft')).not.toBeInTheDocument()
  })
})

test('renders header pull request label element as "Closed" when GraphQL pullRequest.state is "CLOSED"', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Repository() {
          return {pullRequest: buildPullRequest({state: 'CLOSED', viewerCanUpdate: true}), isWritable: true}
        },
        User() {
          return buildViewer()
        },
      }),
    )
  })

  await expect(screen.findByText('Closed')).resolves.toBeInTheDocument()
})

test('renders header pull request label element as "Merged" when GraphQL pullRequest.state is "MERGED" and mergedAt is present', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Repository() {
          return {
            pullRequest: buildPullRequest({state: 'MERGED', mergedAt: '2020-01-01T00:00:00Z', viewerCanUpdate: true}),
            isWritable: true,
          }
        },
        User() {
          return buildViewer()
        },
      }),
    )
  })

  await expect(screen.findByText('Merged')).resolves.toBeInTheDocument()
})

test('renders header pull request label element as "Queued" when GraphQL pullRequest.isInMergeQueue is true', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Repository() {
          return {
            pullRequest: buildPullRequest({state: 'OPEN', isInMergeQueue: true, viewerCanUpdate: true}),
            isWritable: true,
          }
        },
        User() {
          return buildViewer()
        },
      }),
    )
  })

  await expect(screen.findByText('Queued')).resolves.toBeInTheDocument()
})

test('renders header pull request label element as "Open" when GraphQL pullRequest.isInMergeQueue is false"', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Repository() {
          return {
            pullRequest: buildPullRequest({state: 'OPEN', isInMergeQueue: false, viewerCanUpdate: true}),
            isWritable: true,
          }
        },
        User() {
          return buildViewer()
        },
      }),
    )
  })

  await expect(screen.findByText('Open')).resolves.toBeInTheDocument()
})

test('can edit the title', async () => {
  const environment = createMockEnvironment()

  const {user} = render(<TestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Repository() {
          return {
            pullRequest: buildPullRequest({titleHTML: 'The Best PR', title: 'The Best PR', viewerCanUpdate: true}),
            isWritable: true,
          }
        },
        User() {
          return buildViewer()
        },
      }),
    )
  })

  // Cancel
  await screen.findByText('The Best PR')
  const editButton = await screen.findByRole('button', {name: 'Edit'})
  await user.click(editButton)
  const editInput = await screen.findByLabelText('Edit PR Title')
  await user.type(editInput, 'Correction: An OK PR')
  const cancelButton = await screen.findByText('Cancel')
  await user.click(cancelButton)
  await screen.findByText('The Best PR')

  // Save
  const editButton2 = await screen.findByRole('button', {name: 'Edit'})
  await user.click(editButton)
  await user.click(editButton2)
  const editInput2 = await screen.findByLabelText('Edit PR Title')
  expect((editInput2 as HTMLInputElement).value).toBe('The Best PR')
  await user.type(editInput2, '{backspace}R 2')
  const saveButton = await screen.findByText('Save')
  await user.click(saveButton)
  expect((editInput2 as HTMLInputElement).value).toBe('The Best PR 2')

  expectAnalyticsEvents<PullRequestsTargetType>(
    {
      type: 'edit_pull_request.open',
      target: 'HEADER_EDIT_BUTTON',
      data: {
        app_name: 'pull_request',
      },
    },
    {
      type: 'edit_pull_request.cancel',
      target: 'HEADER_EDIT_CANCEL_BUTTON',
      data: {
        app_name: 'pull_request',
      },
    },
    {
      type: 'edit_pull_request.open',
      target: 'HEADER_EDIT_BUTTON',
      data: {
        app_name: 'pull_request',
      },
    },
    {
      type: 'edit_pull_request.save',
      target: 'HEADER_EDIT_SAVE_BUTTON',
      data: {
        app_name: 'pull_request',
      },
    },
  )
})

describe('branch copy button', () => {
  test('copies branch name to clipboard', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)
    const pullRequest = buildPullRequest({viewerCanUpdate: true})
    const branchName = pullRequest.headRefName

    expect(branchName).not.toBeFalsy()

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          Repository() {
            return {pullRequest, isWritable: true, isFork: false}
          },
          User() {
            return buildViewer()
          },
        }),
      )
    })

    const copyButton = await screen.findByLabelText(`Copy branch name to clipboard`, {selector: 'button'})
    await user.click(copyButton)

    await expect(navigator.clipboard.readText()).resolves.toEqual(branchName)
    expectAnalyticsEvents<PullRequestsTargetType>({
      type: 'header.copy_head_branch_name',
      target: 'COPY_HEAD_BRANCH_NAME_BUTTON',
      data: {
        app_name: 'pull_request',
      },
    })
  })
})

describe('base branch dropdown', () => {
  // mock the branch dropdown
  beforeEach(() => {
    jest.spyOn(SearchIndex.prototype, 'render').mockImplementation(function (this: SearchIndex) {
      void act(() => this.selector.render())
    })

    jest.spyOn(SearchIndex.prototype, 'fetchData').mockImplementation(function (this: SearchIndex) {
      this.knownItems = ['main', 'current-branch', 'another-branch']
      this.isLoading = false
      this.render()
      return Promise.resolve()
    })
  })

  test('can edit base branch', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    const pullRequest = buildPullRequest({titleHTML: 'The Best PR', viewerCanUpdate: true})
    const baseBranch = pullRequest.baseRefName
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      return environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          Repository() {
            return {pullRequest, isWritable: true}
          },
          User() {
            return buildViewer()
          },
        }),
      )
    })

    // activate edit mode
    const editButton = await screen.findByRole('button', {name: 'Edit'})
    await user.click(editButton)

    // open the base branch dropdown
    const editBranchDropdown = await screen.findByText(baseBranch)
    await user.click(editBranchDropdown)

    // select a new base branch
    const newBaseBranch = await screen.findByText('another-branch')
    await user.click(newBaseBranch)

    expect(within(editBranchDropdown).getByText('another-branch')).toBeInTheDocument()

    // save the change
    const saveButton = await screen.findByText('Save')
    await user.click(saveButton)

    // confirm the branch change
    const confirmButton = await screen.findByText('Change base')
    await user.click(confirmButton)

    expectAnalyticsEvents<PullRequestsTargetType>(
      {
        type: 'edit_pull_request.open',
        target: 'HEADER_EDIT_BUTTON',
        data: {
          app_name: 'pull_request',
        },
      },
      {
        type: 'edit_pull_request.select_base_branch',
        target: 'HEADER_BASE_BRANCH_BUTTON',
        data: {
          app_name: 'pull_request',
        },
      },
      {
        type: 'edit_pull_request.save',
        target: 'HEADER_EDIT_SAVE_BUTTON',
        data: {
          app_name: 'pull_request',
        },
      },
    )
  })

  test('title error prevents base branch edit dialog from opening', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    const pullRequest = buildPullRequest({titleHTML: 'a', title: 'a', viewerCanUpdate: true})
    const baseBranch = pullRequest.baseRefName
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      return environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          Repository() {
            return {pullRequest, isWritable: true}
          },
          User() {
            return buildViewer()
          },
        }),
      )
    })

    // activate edit mode
    const editButton = await screen.findByRole('button', {name: 'Edit'})
    await user.click(editButton)

    // clear out title text input
    const editInput = await screen.findByLabelText('Edit PR Title')
    expect((editInput as HTMLInputElement).value).toBe('a')
    await user.type(editInput, '{backspace}')
    expect(await screen.findByText("PR title can't be blank")).toBeInTheDocument()

    // open the base branch dropdown
    const editBranchDropdown = await screen.findByText(baseBranch)
    await user.click(editBranchDropdown)

    // select a new base branch
    const newBaseBranch = await screen.findByText('another-branch')
    await user.click(newBaseBranch)

    expect(within(editBranchDropdown).getByText('another-branch')).toBeInTheDocument()

    // save the change
    const saveButton = await screen.findByText('Save')
    await user.click(saveButton)

    // The dialog doesn't show when the input is in an invalid state
    expect(screen.queryByText('Change base')).not.toBeInTheDocument()
  })
})

test('edit title error state', async () => {
  const environment = createMockEnvironment()
  const {user} = render(<TestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Repository() {
          return {
            pullRequest: buildPullRequest({titleHTML: 'The Best PR', title: 'The Best PR', viewerCanUpdate: true}),
            isWritable: true,
          }
        },
        User() {
          return buildViewer()
        },
      }),
    )
  })
  const editButton = await screen.findByRole('button', {name: 'Edit'})
  await user.click(editButton)
  const editInput = await screen.findByLabelText('Edit PR Title')
  expect((editInput as HTMLInputElement).value).toBe('The Best PR')
  await user.type(editInput, '{backspace}R 2')
  const saveButton = await screen.findByText('Save')
  await user.click(saveButton)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    // Mock an error from API
    environment.mock.rejectMostRecentOperation(new Error('whoops'))
  })

  await screen.findByText('Failed to update pull request title: whoops')

  // header goes back into edit mode on failure
  await waitFor(() => expect(screen.queryByRole('button', {name: 'Edit'})).not.toBeInTheDocument())
  await screen.findByText('Save')
})

test('edit title client error state', async () => {
  const environment = createMockEnvironment()
  const {user} = render(<TestComponent environment={environment} />)

  const pullRequest = buildPullRequest({titleHTML: 'a', title: 'a', viewerCanUpdate: true})
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    return environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Repository() {
          return {pullRequest, isWritable: true}
        },
        User() {
          return buildViewer()
        },
      }),
    )
  })

  // activate edit mode
  const editButton = await screen.findByRole('button', {name: 'Edit'})
  await user.click(editButton)

  // clear out title text input
  const editInput = await screen.findByLabelText('Edit PR Title')
  expect((editInput as HTMLInputElement).value).toBe('a')

  // clear out the title
  await user.type(editInput, '{backspace}')
  expect(await screen.findByText("PR title can't be blank")).toBeInTheDocument()

  // error still shows for blank title
  await user.type(editInput, ' ')
  expect(await screen.findByText("PR title can't be blank")).toBeInTheDocument()
})

test('TextInput should focus when clicking the edit button', async () => {
  const environment = createMockEnvironment()
  const {user} = render(<TestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Repository() {
          return {
            pullRequest: buildPullRequest({titleHTML: 'The Best PR', title: 'The Best PR', viewerCanUpdate: true}),
            isWritable: true,
          }
        },
        User() {
          return buildViewer()
        },
      }),
    )
  })
  const editButton = await screen.findByRole('button', {name: 'Edit'})
  await user.click(editButton)
  const editInput = await screen.findByLabelText('Edit PR Title')
  await waitFor(() => expect(editInput).toHaveFocus())
})

test('edit button does not appear for viewer without edit permission', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Repository() {
          return {
            pullRequest: buildPullRequest({titleHTML: 'The Best PR', title: 'The Best PR', viewerCanUpdate: false}),
            isWritable: false,
          }
        },
        User() {
          return buildViewer()
        },
      }),
    )
  })

  expect(screen.queryByRole('button', {name: 'Edit'})).not.toBeInTheDocument()
})

test('edit branch dropdown does not appear when viewer without branch edit permission', async () => {
  const environment = createMockEnvironment()
  const {user} = render(<TestComponent environment={environment} />)

  const pullRequest = buildPullRequest({
    titleHTML: 'The Best PR',
    title: 'The Best PR',
    viewerCanUpdate: true,
    viewerCanChangeBaseBranch: false,
  })
  const baseBranch = pullRequest.baseRefName

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Repository() {
          return {
            pullRequest,
            isWritable: true,
          }
        },
        User() {
          return buildViewer()
        },
      }),
    )
  })

  // activate edit mode
  const editButton = await screen.findByRole('button', {name: 'Edit'})
  await user.click(editButton)

  // open the base branch dropdown
  const branch = await screen.findByText(baseBranch)
  expect(branch.tagName).not.toBe('BUTTON')
})
