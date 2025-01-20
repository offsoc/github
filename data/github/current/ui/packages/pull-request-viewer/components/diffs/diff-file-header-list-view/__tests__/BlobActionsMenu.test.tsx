import {render} from '@github-ui/react-core/test-utils'
import {act, screen, waitFor} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import PullRequestsAppWrapper from '../../../../test-utils/PullRequestsAppWrapper'
import {buildDiffEntry, buildPullRequest} from '../../../../test-utils/query-data'
import BlobActionsMenu from '../BlobActionsMenu'
import type {BlobActionsMenuTestQuery} from './__generated__/BlobActionsMenuTestQuery.graphql'

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  pullRequestId?: string
}

function TestComponent({environment, pullRequestId = 'PR_kwAEAg'}: TestComponentProps) {
  const BlobActionsMenuWithRelayQuery = () => {
    const data = useLazyLoadQuery<BlobActionsMenuTestQuery>(
      graphql`
        query BlobActionsMenuTestQuery(
          $pullRequestId: ID!
          $singleCommitOid: String
          $endOid: String
          $startOid: String
        ) @relay_test_operation {
          pullRequest: node(id: $pullRequestId) {
            ... on PullRequest {
              ...BlobActionsMenu_pullRequest
              comparison(startOid: $startOid, endOid: $endOid, singleCommitOid: $singleCommitOid) {
                diffEntries(first: 20) {
                  nodes {
                    ...BlobActionsMenu_diffEntry
                  }
                }
              }
            }
          }
        }
      `,
      {
        pullRequestId,
      },
    )

    const diffEntry = data.pullRequest?.comparison?.diffEntries.nodes?.[0]
    if (!diffEntry) {
      return null
    }

    return <BlobActionsMenu diffEntry={diffEntry} pullRequest={data.pullRequest} />
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId={pullRequestId}>
      <BlobActionsMenuWithRelayQuery />
    </PullRequestsAppWrapper>
  )
}

describe('show annotations', () => {
  // eslint-disable-next-line jest/expect-expect
  test('renders the show annotations menu item', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              diffEntries: [buildDiffEntry()],
            })
          },
        }),
      )
    })

    const trigger = await screen.findByLabelText('More options')
    await user.click(trigger)
    // TODO re-implement this test when we have the show annotations option
    // await waitFor(() => screen.getByText('Show annotations'))
  })
})

describe('view file', () => {
  test('renders the view file menu item if viewable', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({diffEntries: [buildDiffEntry({isSubmodule: false})]})
          },
        }),
      )
    })

    const trigger = await screen.findByLabelText('More options')
    await user.click(trigger)
    await expect(screen.findByText('View file')).resolves.toBeInTheDocument()
  })

  test('does not render the view file menu item if not viewable', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({diffEntries: [buildDiffEntry({isSubmodule: true})]})
          },
        }),
      )
    })

    const trigger = await screen.findByLabelText('More options')
    await user.click(trigger)
    await waitFor(() => expect(screen.queryByText('View file')).not.toBeInTheDocument())
  })
})

describe('edit file', () => {
  test('does not render the edit menu item if submodule', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerCanEditFiles: true,
              diffEntries: [buildDiffEntry({isSubmodule: true})],
            })
          },
        }),
      )
    })

    const trigger = await screen.findByLabelText('More options')
    await user.click(trigger)
    await waitFor(() => expect(screen.queryByText('Edit file')).not.toBeInTheDocument())
  })

  test('renders the edit menu item disabled if lacking permissions', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerCanEditFiles: false,
              diffEntries: [buildDiffEntry({isSubmodule: false})],
            })
          },
        }),
      )
    })

    const trigger = await screen.findByLabelText('More options')
    await user.click(trigger)
    await expect(
      screen.findByLabelText('You must be signed in and have push access to make changes.'),
    ).resolves.toBeInTheDocument()
  })

  test('renders the edit menu item but disabled if file is binary', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerCanEditFiles: true,
              diffEntries: [buildDiffEntry({isBinary: true})],
            })
          },
        }),
      )
    })

    const trigger = await screen.findByLabelText('More options')
    await user.click(trigger)
    await expect(
      screen.findByLabelText('Online editor is disabled for binary and Git LFS files.'),
    ).resolves.toBeInTheDocument()
  })

  test('renders the edit menu item but disabled if file is an LFS pointer', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerCanEditFiles: true,
              diffEntries: [buildDiffEntry({isLfsPointer: true})],
            })
          },
        }),
      )
    })

    const trigger = await screen.findByLabelText('More options')
    await user.click(trigger)
    await expect(
      screen.findByLabelText('Online editor is disabled for binary and Git LFS files.'),
    ).resolves.toBeInTheDocument()
  })

  test('renders the edit menu item if viewer has permission and file is editable', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerCanEditFiles: true,
              diffEntries: [buildDiffEntry({isBinary: false, isLfsPointer: false, isSubmodule: false})],
            })
          },
        }),
      )
    })

    const trigger = await screen.findByLabelText('More options')
    await user.click(trigger)
    await expect(screen.findByLabelText('Change this file using the online editor.')).resolves.toBeInTheDocument()
  })
})

describe('delete file', () => {
  test('does not render if submodule', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerCanEditFiles: true,
              diffEntries: [buildDiffEntry({isSubmodule: true})],
            })
          },
        }),
      )
    })

    const trigger = await screen.findByLabelText('More options')
    await user.click(trigger)
    await waitFor(() => expect(screen.queryByText('Delete file')).not.toBeInTheDocument())
  })

  test('renders if editable', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerCanEditFiles: true,
              diffEntries: [buildDiffEntry({isSubmodule: false})],
            })
          },
        }),
      )
    })

    const trigger = await screen.findByLabelText('More options')
    await user.click(trigger)
    await expect(screen.findByLabelText('Delete this file')).resolves.toBeInTheDocument()
  })

  test('renders disabled if not editable', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerCanEditFiles: false,
              diffEntries: [buildDiffEntry({isSubmodule: false})],
            })
          },
        }),
      )
    })

    const trigger = await screen.findByLabelText('More options')
    await user.click(trigger)
    await expect(
      screen.findByLabelText('You must be signed in and have push access to delete this file.'),
    ).resolves.toBeInTheDocument()
  })
})

describe('open in desktop', () => {
  // eslint-disable-next-line jest/expect-expect
  test('renders the show in desktop menu item', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({diffEntries: [buildDiffEntry()]})
          },
        }),
      )
    })

    const trigger = await screen.findByLabelText('More options')
    await user.click(trigger)
    // TODO re-implement this test when we have the desktop environment option
    // await waitFor(() => screen.getByText('Open in desktop'))
  })
})
