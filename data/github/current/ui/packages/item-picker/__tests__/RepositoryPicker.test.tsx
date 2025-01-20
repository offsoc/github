import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import type {OperationDescriptor} from 'relay-runtime'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {LABELS} from '../constants/labels'
import {SearchRepositories, TopRepositories} from '../components/RepositoryPicker'
import {TestRepositoryPickerComponent, buildRepository} from '../test-utils/RepositoryPickerHelpers'
import type {RepositoryPickerRepository$data as Repository} from '../components/__generated__/RepositoryPickerRepository.graphql'

test('renders top repositories', async () => {
  const environment = createMockEnvironment()

  environment.mock.queuePendingOperation(TopRepositories, {topRepositoriesFirst: 10, hasIssuesEnabled: true})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      RepositoryConnection() {
        return {
          edges: [
            {node: buildRepository({owner: 'orgA', name: 'repoA'})},
            {node: buildRepository({owner: 'orgA', name: 'repoB'})},
            {node: buildRepository({owner: 'orgB', name: 'repoC'})},
          ],
        }
      },
    })
  })

  render(<TestRepositoryPickerComponent environment={environment} />)

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  const options = await screen.findAllByRole('option')

  expect(options[0]).toHaveTextContent('orgA/repoA')
  expect(options[1]).toHaveTextContent('orgA/repoB')
  expect(options[2]).toHaveTextContent('orgB/repoC')
})

test('renders top repositories and filter some out of the results', async () => {
  const environment = createMockEnvironment()

  environment.mock.queuePendingOperation(TopRepositories, {topRepositoriesFirst: 10, hasIssuesEnabled: true})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      RepositoryConnection() {
        return {
          edges: [
            {node: buildRepository({owner: 'orgA', name: 'repoA'})},
            {node: buildRepository({owner: 'orgA', name: 'repoB'})},
            {node: buildRepository({owner: 'orgB', name: 'repoC'})},
          ],
        }
      },
    })
  })

  const repoFilter = (repo: Repository) => repo.name !== 'repoB'

  render(<TestRepositoryPickerComponent environment={environment} repositoryFilter={repoFilter} />)

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  const options = await screen.findAllByRole('option')

  expect(options[0]).toHaveTextContent('orgA/repoA')
  expect(options[1]).toHaveTextContent('orgB/repoC')
})

test('all results get filtered out', async () => {
  const environment = createMockEnvironment()

  environment.mock.queuePendingOperation(TopRepositories, {topRepositoriesFirst: 10, hasIssuesEnabled: true})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      RepositoryConnection() {
        return {
          edges: [
            {node: buildRepository({owner: 'orgA', name: 'repoA'})},
            {node: buildRepository({owner: 'orgA', name: 'repoB'})},
            {node: buildRepository({owner: 'orgA', name: 'repoC'})},
          ],
        }
      },
    })
  })

  const repoFilter = (repo: Repository) => repo.owner.login !== 'orgA'
  const customNoResultsItem = <div>custom_no_results_element</div>

  render(
    <TestRepositoryPickerComponent
      environment={environment}
      repositoryFilter={repoFilter}
      customNoResultsItem={customNoResultsItem}
    />,
  )

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(1)
  })

  const options = await screen.findAllByRole('option')

  expect(options[0]).toHaveTextContent('custom_no_results_element')
})

test('renders repositories from known orgs first', async () => {
  const environment = createMockEnvironment()

  environment.mock.queuePendingOperation(TopRepositories, {topRepositoriesFirst: 10, hasIssuesEnabled: true})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      RepositoryConnection() {
        return {
          edges: [{node: buildRepository({owner: 'orgA', name: 'top'})}],
        }
      },
    })
  })

  environment.mock.queuePendingOperation(SearchRepositories, {searchQuery: 'search in:name archived:false'})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      SearchResultItemConnection() {
        return {
          nodes: [
            buildRepository({owner: 'orgB', name: 'search1'}),
            buildRepository({owner: 'orgC', name: 'search2'}),
            buildRepository({owner: 'orgA', name: 'search3'}),
          ],
        }
      },
    })
  })

  const {user} = render(<TestRepositoryPickerComponent environment={environment} />)

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  const input = await screen.findByPlaceholderText(LABELS.selectRepository)
  await user.type(input, 'search')
  fireEvent.submit(input)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  const options = await screen.findAllByRole('option')

  // orgA must be first because it was first seen in the top repositories query
  expect(options).toHaveLength(3)
  expect(options[0]).toHaveTextContent('orgA/search3')
  expect(options[1]).toHaveTextContent('orgB/search1')
  expect(options[2]).toHaveTextContent('orgC/search2')
})

test('renders top repositories including initial repository if not returned', async () => {
  const environment = createMockEnvironment()
  const initialRepository = {
    ...buildRepository({owner: 'userB', name: 'repoC'}),
    databaseId: null,
    slashCommandsEnabled: true,
    viewerIssueCreationPermissions: {
      assignable: true,
      labelable: true,
      milestneable: true,
      triageable: true,
      typeable: true,
    },
    $fragmentType: 'RepositoryPickerRepository',
  } as unknown as Repository

  environment.mock.queuePendingOperation(TopRepositories, {topRepositoriesFirst: 10, hasIssuesEnabled: true})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      RepositoryConnection() {
        return {
          edges: [
            {node: buildRepository({owner: 'userA', name: 'repoA'})},
            {node: buildRepository({owner: 'userA', name: 'repoB'})},
          ],
        }
      },
    })
  })

  render(<TestRepositoryPickerComponent environment={environment} initialRepository={initialRepository} />)

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  const options = await screen.findAllByRole('option')

  expect(options[0]).toHaveTextContent('userB/repoC')
  expect(options[1]).toHaveTextContent('userA/repoA')
  expect(options[2]).toHaveTextContent('userA/repoB')
})

test('renders top repositories not including initial repository if it belongs to a different organization', async () => {
  const environment = createMockEnvironment()
  const initialRepository = {
    ...buildRepository({owner: 'orgB', name: 'repoC'}),
    databaseId: null,
    slashCommandsEnabled: true,
    hasIssuesEnabled: true,
    viewerIssueCreationPermissions: {
      assignable: true,
      labelable: true,
      milestneable: true,
      triageable: true,
      typeable: true,
    },
    $fragmentType: 'RepositoryPickerRepository',
  } as unknown as Repository

  environment.mock.queuePendingOperation(TopRepositories, {topRepositoriesFirst: 10, hasIssuesEnabled: true})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      RepositoryConnection() {
        return {
          edges: [
            {node: buildRepository({owner: 'orgA', name: 'repoA'})},
            {node: buildRepository({owner: 'orgA', name: 'repoB'})},
          ],
        }
      },
    })
  })

  render(
    <TestRepositoryPickerComponent
      environment={environment}
      initialRepository={initialRepository}
      organization="orgA"
    />,
  )

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  const options = await screen.findAllByRole('option')

  expect(options[0]).toHaveTextContent('orgA/repoA')
  expect(options[1]).toHaveTextContent('orgA/repoB')
})

test('renders top repositories and excludes the passed `ignoredRepositories`', async () => {
  const environment = createMockEnvironment()

  environment.mock.queuePendingOperation(TopRepositories, {topRepositoriesFirst: 10, hasIssuesEnabled: true})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      RepositoryConnection() {
        return {
          edges: [
            {node: buildRepository({owner: 'userA', name: 'repoA'})},
            {node: buildRepository({owner: 'userA', name: 'repoB'})},
            {node: buildRepository({owner: 'userA', name: 'excludedRepo'})},
          ],
        }
      },
    })
  })

  render(
    <TestRepositoryPickerComponent
      environment={environment}
      initialRepository={undefined}
      ignoredRepositories={['userA/excludedRepo']}
    />,
  )

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  const options = await screen.findAllByRole('option')

  expect(options[0]).toHaveTextContent('userA/repoA')
  expect(options[1]).toHaveTextContent('userA/repoB')
  expect(screen.queryByText('userA/excludedRepo')).not.toBeInTheDocument()
})

test('excluded repositories are not shown in the search results', async () => {
  const environment = createMockEnvironment()

  environment.mock.queuePendingOperation(TopRepositories, {topRepositoriesFirst: 10, hasIssuesEnabled: true})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      RepositoryConnection() {
        return {
          edges: [{node: buildRepository({owner: 'orgA', name: 'top'})}],
        }
      },
    })
  })

  environment.mock.queuePendingOperation(SearchRepositories, {searchQuery: 'search in:name archived:false'})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      SearchResultItemConnection() {
        return {
          nodes: [
            buildRepository({owner: 'orgB', name: 'search1'}),
            buildRepository({owner: 'orgA', name: 'search2'}),
            buildRepository({owner: 'orgA', name: 'search-excluded'}),
          ],
        }
      },
    })
  })

  const {user} = render(
    <TestRepositoryPickerComponent environment={environment} ignoredRepositories={['orgA/search-excluded']} />,
  )

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  const input = await screen.findByPlaceholderText(LABELS.selectRepository)
  await user.type(input, 'search')
  fireEvent.submit(input)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  const options = await screen.findAllByRole('option')

  // orgA must be first because it was first seen in the top repositories query
  expect(options[0]).toHaveTextContent('orgA/search2')
  expect(options[1]).toHaveTextContent('orgB/search1')
  expect(screen.queryByText('userA/search-excluded')).not.toBeInTheDocument()
})
