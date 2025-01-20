import {render} from '@github-ui/react-core/test-utils'
import {act, fireEvent, screen, waitFor} from '@testing-library/react'
import type {OperationDescriptor} from 'relay-runtime'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {IssuePickerHelpers_TestQuery, TestIssuePickerComponent, buildIssue} from '../test-utils/IssuePickerHelpers'
import {IssuePickerSearchGraphQLQuery} from '../components/IssuePicker'
import {getIssueSearchQueries} from '../shared'

jest.setTimeout(4_500)

test('render issues', async () => {
  const environment = setupEnvironment('', '', [buildIssue({title: 'issueA'})])

  render(<TestIssuePickerComponent environment={environment} />)

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(5)
  })

  const options = screen.getAllByRole('option')

  expect(options[0]).toHaveTextContent('issueA')
})

test('hides issues when the hiddenIssues option is supplied', async () => {
  const issueA = buildIssue({title: 'issueA'})
  const issueB = buildIssue({title: 'issueB'})
  const environment = setupEnvironment('', '', [issueA, issueB], [issueA])

  render(<TestIssuePickerComponent environment={environment} hiddenIssueIds={[issueA.id]} />)

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(5)
  })

  const options = screen.getAllByRole('option')

  expect(options[0]).toHaveTextContent('issueB')
})

test('queries for more issues after a search', async () => {
  const environment = setupEnvironment('', '', [buildIssue({title: 'issueA'})])

  const {user} = render(<TestIssuePickerComponent environment={environment} />)

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(5)
  })

  const input = await screen.findByLabelText('Search issues')
  await user.type(input, 'search title')

  let operation = environment.mock.getMostRecentOperation()
  await waitFor(() => {
    operation = environment.mock.getMostRecentOperation()
    expect(operation.fragment.variables).toEqual({
      commenters: `is:issue in:title commenter:@me search title`,
      mentions: `is:issue in:title mentions:@me search title`,
      assignee: `is:issue in:title assignee:@me search title`,
      author: `is:issue in:title author:@me search title`,
      open: `is:issue in:title state:open search title`,
      first: 10,
      queryIsUrl: false,
      resource: '',
    })
  })

  await act(() => {
    environment.mock.resolveMostRecentOperation(
      MockPayloadGenerator.generate(operation, {
        Query() {
          return {
            commenters: {
              nodes: [buildIssue({title: 'newly searched issue'})],
            },
            mentions: {
              nodes: [],
            },
            assignee: {
              nodes: [],
            },
            author: {
              nodes: [],
            },
            open: {
              nodes: [],
            },
          }
        },
      }),
    )
  })

  await waitFor(async () => {
    expect(screen.getAllByRole('option')).toHaveLength(1)
  })

  const options = screen.getAllByRole('option')
  expect(options[0]).toHaveTextContent('newly searched issue')
})

test('renders a custom title', async () => {
  const environment = setupEnvironment('', '', [buildIssue({title: 'issueA'})])

  render(<TestIssuePickerComponent environment={environment} title="Hello World" />)

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  await waitFor(async () => {
    expect(await screen.findByRole('heading', {name: 'Hello World'})).toBeInTheDocument()
  })
})

test('opens the picker using triggerOpen', async () => {
  const environment = setupEnvironment('', '', [buildIssue({title: 'issueA'})])

  render(<TestIssuePickerComponent environment={environment} triggerOpen />)

  expect(await screen.findByRole('heading', {name: 'Choose issue'})).toBeInTheDocument()

  await waitFor(async () => {
    expect(screen.getAllByRole('option')).toHaveLength(5)
  })
})

test('filters issues by repository', async () => {
  const repositoryNameWithOwner = 'github/github'
  const environment = setupEnvironment('', '', [buildIssue({title: 'issueA'})], [], repositoryNameWithOwner)

  render(
    <TestIssuePickerComponent
      environment={environment}
      triggerOpen
      repositoryNameWithOwner={repositoryNameWithOwner}
    />,
  )

  await waitFor(async () => {
    expect(screen.getAllByRole('option')).toHaveLength(5)
  })

  let operation = environment.mock.getMostRecentOperation()
  await waitFor(() => {
    operation = environment.mock.getMostRecentOperation()

    expect(operation.fragment.variables).toEqual({
      commenters: `repo:github/github is:issue in:title commenter:@me`,
      mentions: `repo:github/github is:issue in:title mentions:@me`,
      assignee: `repo:github/github is:issue in:title assignee:@me`,
      author: `repo:github/github is:issue in:title author:@me`,
      open: `repo:github/github is:issue in:title state:open`,
      first: 10,
      queryIsUrl: false,
      resource: '',
    })
  })
})

test('filters issues by issue number', async () => {
  const repositoryNameWithOwner = 'github/github'
  const environment = setupEnvironment('', '', [buildIssue({title: 'issueA'})], [], repositoryNameWithOwner)

  const {user} = render(
    <TestIssuePickerComponent
      environment={environment}
      triggerOpen
      repositoryNameWithOwner={repositoryNameWithOwner}
    />,
  )

  await waitFor(async () => {
    expect(screen.getAllByRole('option')).toHaveLength(5)
  })

  const input = await screen.findByLabelText('Search issues')
  await user.type(input, '1')

  let operation = environment.mock.getMostRecentOperation()
  await waitFor(() => {
    operation = environment.mock.getMostRecentOperation()

    expect(operation.fragment.variables).toEqual({
      commenters: `repo:github/github is:issue in:title in:number commenter:@me 1`,
      mentions: `repo:github/github is:issue in:title in:number mentions:@me 1`,
      assignee: `repo:github/github is:issue in:title in:number assignee:@me 1`,
      author: `repo:github/github is:issue in:title in:number author:@me 1`,
      open: `repo:github/github is:issue in:title in:number state:open 1`,
      first: 10,
      queryIsUrl: false,
      resource: '',
    })
  })
})

test('loads selected issue when its not returned in the initial search query', async () => {
  const repositoryNameWithOwner = 'github/github'
  const environment = setupEnvironment('', '', [buildIssue({title: 'issueA'})], [], repositoryNameWithOwner)
  const selectedIssue = buildIssue({title: 'JIT Loaded Issue'})

  render(
    <TestIssuePickerComponent
      environment={environment}
      triggerOpen
      repositoryNameWithOwner={repositoryNameWithOwner}
      selectedIssueIds={[selectedIssue.id]}
    />,
  )

  await waitFor(async () => {
    expect(screen.getAllByRole('option')).toHaveLength(5)
  })

  let operation = environment.mock.getMostRecentOperation()
  await waitFor(() => {
    operation = environment.mock.getMostRecentOperation()

    expect(operation.fragment.variables).toEqual({
      ids: [selectedIssue.id],
    })
  })

  act(() => {
    environment.mock.resolveMostRecentOperation(
      MockPayloadGenerator.generate(operation, {
        Issue() {
          return selectedIssue
        },
      }),
    )
  })

  await waitFor(async () => {
    expect(screen.getAllByRole('option')).toHaveLength(6)
  })

  const options = screen.getAllByRole('option')
  expect(options[0]).toHaveTextContent(`${selectedIssue.title}${selectedIssue.repository.nameWithOwner}`)
})

test('shows resource result if querying by valid issue URL', async () => {
  const environment = setupEnvironment('', '', [buildIssue({title: 'issueA'})])

  const {user} = render(<TestIssuePickerComponent environment={environment} />)

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(5)
  })

  const input = await screen.findByLabelText('Search issues')
  await user.type(input, 'https://github.com/github/github/issues/1')

  let operation = environment.mock.getMostRecentOperation()
  await waitFor(() => {
    operation = environment.mock.getMostRecentOperation()
    expect(operation.fragment.variables).toEqual({
      commenters: `is:issue in:title commenter:@me https://github.com/github/github/issues/1`,
      mentions: `is:issue in:title mentions:@me https://github.com/github/github/issues/1`,
      assignee: `is:issue in:title assignee:@me https://github.com/github/github/issues/1`,
      author: `is:issue in:title author:@me https://github.com/github/github/issues/1`,
      open: `is:issue in:title state:open https://github.com/github/github/issues/1`,
      first: 10,
      resource: 'https://github.com/github/github/issues/1',
      queryIsUrl: true,
    })
  })

  await act(() => {
    environment.mock.resolveMostRecentOperation(
      MockPayloadGenerator.generate(operation, {
        Query() {
          return {
            commenters: {
              nodes: [buildIssue({title: "don't show this one"})],
            },
            mentions: {
              nodes: [],
            },
            assignee: {
              nodes: [],
            },
            author: {
              nodes: [],
            },
            open: {
              nodes: [],
            },
            resource: {
              ...buildIssue({title: 'newly searched issue'}),
            },
          }
        },
      }),
    )
  })

  await waitFor(async () => {
    expect(screen.getAllByRole('option')).toHaveLength(1)
  })

  const options = screen.getAllByRole('option')
  expect(options[0]).toHaveTextContent('newly searched issue')
})

test('shows rest of results if issue URL has no result', async () => {
  const environment = setupEnvironment('', '', [buildIssue({title: 'issueA'})])

  const {user} = render(<TestIssuePickerComponent environment={environment} />)

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(5)
  })

  const input = await screen.findByLabelText('Search issues')
  await user.type(input, 'https://github.com/github/github/issues/1000')

  let operation = environment.mock.getMostRecentOperation()
  await waitFor(() => {
    operation = environment.mock.getMostRecentOperation()
    expect(operation.fragment.variables).toEqual({
      commenters: `is:issue in:title commenter:@me https://github.com/github/github/issues/1000`,
      mentions: `is:issue in:title mentions:@me https://github.com/github/github/issues/1000`,
      assignee: `is:issue in:title assignee:@me https://github.com/github/github/issues/1000`,
      author: `is:issue in:title author:@me https://github.com/github/github/issues/1000`,
      open: `is:issue in:title state:open https://github.com/github/github/issues/1000`,
      first: 10,
      resource: 'https://github.com/github/github/issues/1000',
      queryIsUrl: true,
    })
  })

  await act(() => {
    environment.mock.resolveMostRecentOperation(
      MockPayloadGenerator.generate(operation, {
        Query() {
          return {
            commenters: {
              nodes: [buildIssue({title: 'show this one'})],
            },
            mentions: {
              nodes: [],
            },
            assignee: {
              nodes: [],
            },
            author: {
              nodes: [],
            },
            open: {
              nodes: [],
            },
            resource: null,
          }
        },
      }),
    )
  })

  await waitFor(async () => {
    expect(screen.getAllByRole('option')).toHaveLength(1)
  })

  const options = screen.getAllByRole('option')
  expect(options[0]).toHaveTextContent('show this one')
})

function setupEnvironment(
  owner = '',
  searchQuery = '',
  commentersNodes: Array<ReturnType<typeof buildIssue>> = [],
  activeNodes: Array<ReturnType<typeof buildIssue>> = [],
  repositoryFilter?: string,
) {
  const environment = createMockEnvironment()

  environment.mock.queuePendingOperation(
    IssuePickerHelpers_TestQuery,
    getIssueSearchQueries(owner, searchQuery, repositoryFilter),
  )
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Query() {
        return {
          issue: {
            subIssues: {
              nodes: activeNodes,
            },
          },
        }
      },
    })
  })
  environment.mock.queuePendingOperation(
    IssuePickerSearchGraphQLQuery,
    getIssueSearchQueries(owner, searchQuery, repositoryFilter),
  )
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Query() {
        return {
          commenters: {
            nodes: commentersNodes,
          },
          mentions: {
            nodes: [buildIssue({title: 'mentions'})],
          },
          assignee: {
            nodes: [buildIssue({title: 'assignee'})],
          },
          author: {
            nodes: [buildIssue({title: 'author'})],
          },
          open: {
            nodes: [buildIssue({title: 'open'})],
          },
        }
      },
    })
  })

  return environment
}
