import {useRef, useState} from 'react'
import {act, render, screen, within} from '@testing-library/react'
import {renderRelay} from '@github-ui/relay-test-utils'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {graphql} from 'relay-runtime'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {RelayEnvironmentProvider, useLazyLoadQuery} from 'react-relay'
import {MockPayloadGenerator} from 'relay-test-utils'

import {mockAssigneesResolvers} from './helper'
import {ItemPickerAssignees, type ItemPickerAssigneesProps} from '../ItemPickerAssignees'

import type {ItemPickerAssigneesTestQuery as ItemPickerAssigneesTestQueryType} from './__generated__/ItemPickerAssigneesTestQuery.graphql'
import type {ItemPickerAssigneesList_Query} from '../__generated__/ItemPickerAssigneesList_Query.graphql'

type ItemPickerAssigneesExampleComponentProps = Partial<ItemPickerAssigneesProps>

const ItemPickerAssigneesExampleComponent = ({
  selectedAssigneesKey,
  currentViewerKey,
  ...props
}: ItemPickerAssigneesExampleComponentProps) => {
  const assigneesButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<boolean>(props.open || false)

  return (
    <>
      <button
        ref={assigneesButtonRef}
        onClick={() => {
          setOpen(!open)
        }}
      >
        Edit Button
      </button>
      <ItemPickerAssignees
        title="Set assignees"
        assigneesButtonRef={assigneesButtonRef}
        open={open}
        setOpen={setOpen}
        repo="repo"
        owner="owner"
        number={1}
        selectedAssigneesKey={selectedAssigneesKey!}
        currentViewerKey={currentViewerKey!}
        {...props}
      />
    </>
  )
}

// Use this for tests where we want to fail nested queries
const ItemPickerAssigneesExampleComponentWithQuery = () => {
  const assigneesButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<boolean>(true)

  const data = useLazyLoadQuery<ItemPickerAssigneesTestQueryType>(testQuery, {
    number: 1,
    owner: 'owner',
    repo: 'repo',
  })

  return (
    <ItemPickerAssignees
      title="Set assignees"
      assigneesButtonRef={assigneesButtonRef}
      open={open}
      setOpen={setOpen}
      repo="repo"
      owner="ownder"
      number={1}
      selectedAssigneesKey={data.repository!.issue!.assignees}
      currentViewerKey={data.viewer}
    />
  )
}

const testQuery = graphql`
  query ItemPickerAssigneesTestQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
    viewer {
      ...ItemPickerAssignees_CurrentViewerFragment
    }
    repository(owner: $owner, name: $repo) {
      issue(number: $number) {
        assignees(first: 5) {
          ...ItemPickerAssignees_SelectedAssigneesFragment
        }
      }
    }
  }
`

const setup = (args?: {itemsCount?: number; selectedCount?: number} & ItemPickerAssigneesExampleComponentProps) => {
  const mockOnSubmit = jest.fn()
  const {itemsCount, selectedCount, ...props} = args || {}
  const {relayMockEnvironment, user} = renderRelay<{
    rootQuery: ItemPickerAssigneesTestQueryType
    listQuery: ItemPickerAssigneesList_Query
  }>(
    ({queryData}) => (
      <ItemPickerAssigneesExampleComponent
        selectedAssigneesKey={queryData.rootQuery.repository!.issue!.assignees}
        currentViewerKey={queryData.rootQuery.viewer}
        open
        onSubmit={mockOnSubmit}
        {...props}
      />
    ),
    {
      wrapper: Wrapper,
      relay: {
        queries: {
          rootQuery: {
            query: testQuery,
            type: 'fragment',
            variables: {owner: 'owner', repo: 'repo', number: 1},
          },
          listQuery: {
            type: 'lazy',
          },
        },
        mockResolvers: mockAssigneesResolvers(itemsCount, selectedCount),
      },
    },
  )

  return {environment: relayMockEnvironment, mockOnSubmit, user}
}

describe('ItemPickerAssignees', () => {
  it('renders a title', () => {
    setup()
    expect(screen.getByText('Set assignees')).toBeInTheDocument()
  })

  it('displays an error when the max number of assignees is reached', () => {
    setup({maxSelectableItems: 1, selectedCount: 0})

    const option = screen.getByTitle('assignee 0')
    act(() => {
      option.click()
    })
    expect(screen.getByText('You can select up to 1 assignee(s).')).toBeInTheDocument()
  })

  it('sets a custom max number error when configured by the user', () => {
    setup({maxSelectableItems: 1, selectedCount: 0, maxSelectableItemsContent: 'Custom error message'})
    const option = screen.getByTitle('assignee 0')
    act(() => {
      option.click()
    })
    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })

  it('correctly filters selected and unselected assignees', () => {
    setup({itemsCount: 3, selectedCount: 1})

    const unSelectedOptions = within(screen.getByRole('listbox')).getAllByRole('option', {selected: false})
    const selectedOptions = within(screen.getByRole('listbox')).getAllByRole('option', {selected: true})

    expect(unSelectedOptions).toHaveLength(3)
    expect(selectedOptions).toHaveLength(1)
    expect(selectedOptions[0]).toHaveTextContent('assignee 0')

    expect(unSelectedOptions[0]).toHaveTextContent('viewer')
    expect(unSelectedOptions[1]).toHaveTextContent('assignee 1')
    expect(unSelectedOptions[2]).toHaveTextContent('assignee 2')
  })

  it('sends correct data on submit', () => {
    const {mockOnSubmit} = setup({itemsCount: 3, selectedCount: 1})

    const saveButton = screen.getByRole('button', {name: 'Save'})
    act(() => {
      saveButton.click()
    })

    expect(mockOnSubmit.mock.calls[0][0]).toHaveLength(1)
    expect(mockOnSubmit.mock.calls[0][0]).toStrictEqual([
      {
        id: 'assignee-0',
        additionalInfo: {
          name: `assignee 0`,
          login: `assignee 0`,
          avatarUrl: 'https://avatars.githubusercontent.com/u/1?size=64',
        },
      },
    ])
  })
})

describe('ItemPickerAssignees Error handling', () => {
  jest.useFakeTimers()
  let originalConsoleError: typeof console.error

  beforeEach(() => {
    // eslint-disable-next-line no-console
    originalConsoleError = console.error
    // eslint-disable-next-line no-console
    console.error = jest.fn()
  })

  afterEach(() => {
    // eslint-disable-next-line no-console
    console.error = originalConsoleError
    jest.restoreAllMocks()
  })

  it('should show an error message when the hasError prop is set to true', async () => {
    const {environment} = createRelayMockEnvironment()

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ItemPickerAssigneesExampleComponent open hasError />
      </RelayEnvironmentProvider>,
    )

    expect(screen.getByText(/One or more assignees do not exist/i)).toBeInTheDocument()
  })

  it('should show the correct error when the fetch for the repo assignees fails', async () => {
    const {environment} = createRelayMockEnvironment()
    const MockError = new Error('An error occurred')

    // Mock the root query
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation))
    // Mock the list fetch
    environment.mock.queueOperationResolver(() => MockError)

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ItemPickerAssigneesExampleComponentWithQuery />
      </RelayEnvironmentProvider>,
    )

    expect(screen.getByText(/We couldn't load the assignees/i)).toBeInTheDocument()

    // we re-throw errors out of band in order to report them to Sentry
    try {
      await act(() => jest.runAllTimers())
      throw new Error('An error should have been thrown')
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toBe(MockError)
    }
  })

  it('should show an error banner when the fetch for the repo assignees fails with a user search query', async () => {
    const {environment, user} = setup({itemsCount: 3, selectedCount: 1})

    const searchInput = screen.getByTestId('item-picker-search-input')
    await user.type(searchInput, 'search query')
    await act(async () => jest.runAllTimers())
    const MockError = new Error('An error occurred')

    await act(async () => {
      environment.mock.rejectMostRecentOperation(() => MockError)
    })

    expect(screen.getByText(/We couldn't load the assignees/i)).toBeInTheDocument()

    // we re-throw errors out of band in order to report them to Sentry
    try {
      await act(() => jest.runAllTimers())
      throw new Error('An error should have been thrown')
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toBe(MockError)
    }
  })
})

describe('ItemPickerAssignees Search', () => {
  jest.useFakeTimers()
  it('Correctly searches for assignees', async () => {
    const {environment, user} = setup({itemsCount: 3, selectedCount: 1})
    const searchInput = screen.getByTestId('item-picker-search-input')

    await user.type(searchInput, 'assignee 0')

    act(() => jest.runAllTimers())

    const searchSpinner = screen.getByTestId('item-picker-search-loading')
    expect(searchSpinner).toBeVisible()

    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        expect(operation.fragment.node.name).toEqual('ItemPickerAssigneesList_Query')
        return MockPayloadGenerator.generate(operation, mockAssigneesResolvers(3))
      })
    })

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(1)

    expect(options[0]).toHaveTextContent('assignee 0')
    expect(searchSpinner).not.toBeVisible()
  })
})
