import {act, render, screen} from '@testing-library/react'
import {noop} from '@github-ui/noop'
import {IssueTransferDialog} from '../IssueTransferDialog'
import {type ReactNode, Suspense} from 'react'
import {RelayEnvironmentProvider} from 'react-relay'
import {MockPayloadGenerator, createMockEnvironment} from 'relay-test-utils'
import type {RelayMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'
import {TopRepositories} from '@github-ui/item-picker/RepositoryPicker'
import {ThemeProvider} from '@primer/react'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {LABELS} from '../../../constants/labels'

const TestWrapper = ({environment, children}: {environment: RelayMockEnvironment; children: ReactNode}) => (
  <ThemeProvider>
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="Loading">{children}</Suspense>
    </RelayEnvironmentProvider>
  </ThemeProvider>
)

jest.mock('@github-ui/ssr-utils', () => ({
  ...jest.requireActual('@github-ui/ssr-utils'),
  ssrSafeWindow: {
    ...jest.requireActual('@github-ui/ssr-utils').ssrSafeWindow,
    location: {
      href: 'base-url',
    },
  },
}))

const publicRepos = [
  {
    databaseId: 1,
    id: 'R_1',
    name: 'cool-repo',
    nameWithOwner: `cool-org/cool-repo`,
    owner: {
      login: 'cool-org',
    },
    isPrivate: false,
    isArchived: false,
  },
  {
    databaseId: 2,
    id: 'R_2',
    name: 'another-repo',
    nameWithOwner: `cool-org/another-repo`,
    owner: {
      login: 'cool-org',
    },
    isPrivate: false,
    isArchived: false,
  },
  {
    databaseId: 3,
    id: 'R_3',
    name: 'scoped-repo',
    nameWithOwner: `cool-org/scoped-repo`,
    owner: {
      login: 'cool-org',
    },
    isPrivate: false,
    isArchived: false,
  },
  {
    databaseId: 4,
    id: 'R_4',
    name: 'archived',
    nameWithOwner: `cool-org/archived`,
    owner: {
      login: 'cool-org',
    },
    isPrivate: false,
    isArchived: true,
  },
  {
    databaseId: 5,
    id: 'R_5',
    name: 'other',
    nameWithOwner: `other-org/other`,
    owner: {
      login: 'other-org',
    },
    isPrivate: false,
    isArchived: false,
  },
]

const privateRepos = [
  {
    databaseId: 21,
    id: 'R_21',
    name: 'private-repo',
    nameWithOwner: `cool-org/private-repo`,
    owner: {
      login: 'cool-org',
    },
    isPrivate: true,
    isArchived: false,
  },
]

const mockRepositories = [...publicRepos, ...privateRepos]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockTopRepositories = (environment: RelayMockEnvironment, repos?: any[]) => {
  environment.mock.queuePendingOperation(TopRepositories, {hasIssuesEnabled: true})
  environment.mock.queueOperationResolver(operation =>
    MockPayloadGenerator.generate(operation, {
      RepositoryConnection: () => ({
        edges: (repos ?? mockRepositories).map(repo => ({
          node: repo,
        })),
      }),
    }),
  )
}

const mockCommitMutation = (environment: RelayMockEnvironment) => {
  // environment.mock.queuePendingOperation(TopRepositories, {hasIssuesEnabled: true})
  environment.mock.queueOperationResolver(operation =>
    MockPayloadGenerator.generate(operation, {
      Issue: () => ({
        url: 'issue-transferred-url',
      }),
    }),
  )
}

test('issue transfer dialog is rendered', () => {
  const environment = createMockEnvironment()
  mockTopRepositories(environment)

  render(
    <TestWrapper environment={environment}>
      <IssueTransferDialog owner="" repository="" issueId="" onClose={noop} />
    </TestWrapper>,
  )

  expect(screen.getAllByText('Transfer issue')).toHaveLength(2)
  expect(
    screen.getByText(
      'This does not scrub any issue content. Content such as text references to other issues, pull requests, projects and teams will still appear in the description or comments. Labels will be transferred.',
    ),
  ).toBeInTheDocument()
  expect(screen.getByLabelText('Select repository')).toBeInTheDocument()
  expect(screen.getByText('Cancel')).toBeInTheDocument()
})

test('filtered repositories are not shown', () => {
  const environment = createMockEnvironment()
  mockTopRepositories(environment)

  render(
    <TestWrapper environment={environment}>
      <IssueTransferDialog owner="cool-org" repository="scoped-repo" issueId="12" onClose={noop} />
    </TestWrapper>,
  )

  const repoPicker = screen.getByLabelText('Select repository')
  act(() => repoPicker.click())

  expect(screen.getByText('another-repo')).toBeInTheDocument()
  expect(screen.queryByText('scoped-repo')).not.toBeInTheDocument()
  expect(screen.queryByText('archived')).not.toBeInTheDocument()
  expect(screen.queryByText('other')).not.toBeInTheDocument()
})

test('calls onClose on when clicking close buttons', () => {
  const environment = createMockEnvironment()
  mockTopRepositories(environment)
  const onCloseMock = jest.fn()

  render(
    <TestWrapper environment={environment}>
      <IssueTransferDialog owner="" repository="" issueId="" onClose={onCloseMock} />
    </TestWrapper>,
  )

  const closeButton = screen.getByLabelText('Close')
  closeButton.click()

  const cancelButton = screen.getByText('Cancel')
  cancelButton.click()

  expect(onCloseMock).toHaveBeenCalledTimes(2)
})

test('initiates a network request when pressing transfer issue', () => {
  const environment = createMockEnvironment()
  mockTopRepositories(environment)
  const onCloseMock = jest.fn()

  render(
    <TestWrapper environment={environment}>
      <IssueTransferDialog owner="" repository="" issueId="" onClose={onCloseMock} />
    </TestWrapper>,
  )

  const transferButton = screen.getByRole('button', {name: 'Transfer issue'})
  mockCommitMutation(environment)

  act(() => {
    transferButton.click()
  })

  expect(ssrSafeWindow!.location.href).toBe('issue-transferred-url')
})

test('shows a warning if user wants to transfer from private to public repo', () => {
  const environment = createMockEnvironment()
  mockTopRepositories(environment, publicRepos)
  const onCloseMock = jest.fn()

  render(
    <TestWrapper environment={environment}>
      <IssueTransferDialog owner="" repository="" issueId="" isRepoPrivate={true} onClose={onCloseMock} />
    </TestWrapper>,
  )
  const repoPicker = screen.getByLabelText('Select repository')
  act(() => repoPicker.click())

  const banner = screen.getByText(/no repositories match\./i)
  expect(banner).toBeInTheDocument()
})

test('does not show a warning if user wants to transfer from private to private', () => {
  const environment = createMockEnvironment()
  mockTopRepositories(environment)
  const onCloseMock = jest.fn()

  render(
    <TestWrapper environment={environment}>
      <IssueTransferDialog
        owner="cool-org"
        repository="scoped-repo"
        issueId="21"
        isRepoPrivate={true}
        onClose={onCloseMock}
      />
    </TestWrapper>,
  )
  const repoPicker = screen.getByLabelText('Select repository')
  act(() => repoPicker.click())

  const option = screen.getByRole('option', {
    name: /private-repo/i,
  })
  expect(option).toBeInTheDocument()

  act(() => {
    option.click()
  })

  expect(screen.queryByText(LABELS.transfer.repoUnavailable)).not.toBeInTheDocument()
})
