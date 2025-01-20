import {useRepositoryItems} from '../use-repository-items'
import {act, render, screen} from '@testing-library/react'
import {RelayEnvironmentProvider} from 'react-relay'
import type {MockEnvironment} from 'relay-test-utils'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

const RepoList = () => {
  const {repositories, loading, totalCount} = useRepositoryItems('filterText')
  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div>Total count: {totalCount}</div>
      {repositories.map(repo => (
        <div key={repo.id}>{repo.name}</div>
      ))}
    </div>
  )
}

describe('useRepositoryItems', () => {
  test('Renders the loading state', () => {
    const environment = createMockEnvironment()
    render(
      <RelayEnvironmentProvider environment={environment}>
        <RepoList />
      </RelayEnvironmentProvider>,
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  test('Renders the repository results', async () => {
    const environment = createMockEnvironment()
    render(
      <RelayEnvironmentProvider environment={environment}>
        <RepoList />
      </RelayEnvironmentProvider>,
    )
    resolveRepoSearch(environment)
    await screen.findByText('first', {exact: false})
    expect(screen.getByText('first')).toBeInTheDocument()
    expect(screen.getByText('second')).toBeInTheDocument()
    expect(screen.getByText(`Total count: ${totalCount}`)).toBeInTheDocument()
  })
})

function resolveRepoSearch(environment: MockEnvironment) {
  act(() =>
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection: () => ({
          nodes: repositories,
          repositoryCount: totalCount,
        }),
      }),
    ),
  )
}

const repositories = [
  {
    databaseId: 1,
    id: 'R_1',
    name: 'first',
    nameWithOwner: `org/first`,
    owner: {
      login: 'org',
    },
    isPrivate: false,
    isArchived: false,
  },
  {
    databaseId: 2,
    id: 'R_2',
    name: 'second',
    nameWithOwner: `org/second`,
    owner: {
      login: 'org',
    },
    isPrivate: false,
    isArchived: false,
  },
]

const totalCount = repositories.length * 5
