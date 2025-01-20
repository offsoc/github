import {Button} from '@primer/react'
import {useRef, useState} from 'react'
import {type ItemPickerMilestonesProps, ItemPickerMilestones} from '../ItemPickerMilestones'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {renderRelay} from '@github-ui/relay-test-utils'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import type {ItemPickerMilestonesList_Query} from '../../milestones/__generated__/ItemPickerMilestonesList_Query.graphql'
import {mockMilestonesResolvers} from '../../milestones/__tests__/helper'
import {graphql} from 'relay-runtime'
import type {ItemPickerMilestonesTestQuery} from './__generated__/ItemPickerMilestonesTestQuery.graphql'
import {RelayEnvironmentProvider, useLazyLoadQuery} from 'react-relay'
import {act, render, screen} from '@testing-library/react'
import {MockPayloadGenerator} from 'relay-test-utils'

type ItemPickerMilestonesExampleComponentProps = Partial<ItemPickerMilestonesProps>

function ItemPickerMilestonesExampleComponent({
  owner = 'owner',
  repo = 'repo',
  selectedMilestonesKey,
  ...args
}: ItemPickerMilestonesExampleComponentProps) {
  const milestonesButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<boolean>(args.open || false)
  return (
    <>
      <Button
        ref={milestonesButtonRef}
        onClick={() => {
          setOpen(!open)
        }}
      >
        open
      </Button>

      <ItemPickerMilestones
        title={'title'}
        owner={owner}
        repo={repo}
        selectedMilestonesKey={selectedMilestonesKey!}
        milestonesButtonRef={milestonesButtonRef}
        open={open}
        setOpen={setOpen}
        {...args}
      />
    </>
  )
}

const testQuery = graphql`
  query ItemPickerMilestonesTestQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
    repository(owner: $owner, name: $repo) {
      issue(number: $number) {
        milestone {
          ...ItemPickerMilestones_SelectedMilestoneFragment
        }
      }
      ...ItemPickerMilestonesList_Fragment
    }
  }
`

function ItemPickerMilestonesExampleComponentWithQuery() {
  const milestonesButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<boolean>(true)

  const data = useLazyLoadQuery<ItemPickerMilestonesTestQuery>(testQuery, {
    number: 1,
    owner: 'owner',
    repo: 'repo',
  })

  return (
    <ItemPickerMilestones
      title="Set milestones"
      milestonesButtonRef={milestonesButtonRef}
      open={open}
      setOpen={setOpen}
      repo="repo"
      owner="owner"
      selectedMilestonesKey={data.repository?.issue?.milestone || null}
    />
  )
}

const setup = (args?: {itemsCount?: number; hasSelectedMilestone?: boolean}) => {
  const mockOnSubmit = jest.fn()
  const {itemsCount, hasSelectedMilestone} = args || {}

  const {relayMockEnvironment, user} = renderRelay<{
    rootQuery: ItemPickerMilestonesTestQuery
    listQuery: ItemPickerMilestonesList_Query
  }>(
    ({queryData}) => (
      <ItemPickerMilestonesExampleComponent
        selectedMilestonesKey={queryData.rootQuery.repository?.issue?.milestone}
        open
        onSubmit={mockOnSubmit}
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
          listQuery: {type: 'lazy'},
        },
        mockResolvers: mockMilestonesResolvers(itemsCount, hasSelectedMilestone),
      },
    },
  )

  return {environment: relayMockEnvironment, mockOnSubmit, user}
}

describe('ItemPickerMilestones', () => {
  jest.useFakeTimers()

  it('Renders two milestones and 1 selected milestone', () => {
    setup({itemsCount: 3, hasSelectedMilestone: true})

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)
    expect(screen.getByText('milestone 0')).toBeInTheDocument()
    expect(screen.getByText('milestone 1')).toBeInTheDocument()
    expect(screen.getByText('milestone 2')).toBeInTheDocument()
  })

  it('Renders loading state', () => {
    const {environment} = createRelayMockEnvironment()

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ItemPickerMilestonesExampleComponent open />
      </RelayEnvironmentProvider>,
    )

    const loadingState = screen.getAllByTestId('loading-skeleton')
    expect(loadingState[0]).toBeVisible()
  })

  it('Sends the data with project type on submit', () => {
    const {mockOnSubmit} = setup({itemsCount: 3, hasSelectedMilestone: true})

    const submitButton = screen.getByRole('button', {name: 'Save'})
    act(() => {
      submitButton.click()
    })

    expect(mockOnSubmit.mock.calls[0][0]).toStrictEqual({
      id: 'milestone-0',
      additionalInfo: {
        title: 'milestone 0',
        state: 'OPEN',
      },
    })
  })
})

describe('ItemPickerMilestones Search', () => {
  it('Correctly searches for milestones', async () => {
    const {environment, user} = setup({itemsCount: 3, hasSelectedMilestone: true})
    const searchInput = screen.getByTestId('item-picker-search-input')
    await user.type(searchInput, 'milestone 1')
    act(() => jest.runAllTimers())

    const searchSpinner = screen.getByTestId('item-picker-search-loading')
    expect(searchSpinner).toBeVisible()

    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        expect(operation.fragment.node.name).toEqual('ItemPickerMilestonesList_Query')
        return MockPayloadGenerator.generate(operation, mockMilestonesResolvers(3))
      })
    })

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(1)

    expect(options[0]).toHaveTextContent('milestone 1')
    expect(searchSpinner).not.toBeVisible()
  })
})

describe('ItemPickerMilestones Keyboard interaction tests', () => {
  jest.useFakeTimers()

  it('user can tab between elements when the list is open', async () => {
    const {user} = setup({itemsCount: 3})

    const searchInput = screen.getByTestId('item-picker-search-input')
    expect(searchInput).toHaveFocus() // search input should be the first focused element when dialog is opened

    // type something in the search input box to render clear input button
    await user.type(searchInput, '0')
    act(() => jest.runAllTimers())

    const clearInputButton = screen.getByRole('button', {name: 'Clear'})
    const cancelButton = screen.getByRole('button', {name: 'Cancel'})
    const saveButton = screen.getByRole('button', {name: 'Save'})
    const closeButton = screen.getByRole('button', {name: 'Close'})
    const label0Button = screen.getByRole('option', {name: 'milestone 1'})

    await user.keyboard('[ShiftLeft>]')
    await user.keyboard('[Tab]')
    await user.keyboard('[/ShiftLeft]')
    expect(closeButton).toHaveFocus()

    await user.keyboard('[Tab]')
    expect(searchInput).toHaveFocus()

    await user.keyboard('[Tab]')
    expect(clearInputButton).toHaveFocus()

    await user.keyboard('[Tab]')
    expect(label0Button).toHaveFocus()

    await user.keyboard('[Tab]')
    expect(cancelButton).toHaveFocus()
    await user.keyboard('[Tab]')
    expect(saveButton).toHaveFocus()
  })

  it('arrow up/down key to navigate between items in the action list', async () => {
    const {user} = setup({itemsCount: 3})
    act(() => screen.getByRole('option', {name: 'milestone 0'}).focus())
    expect(screen.getByRole('option', {name: 'milestone 0'})).toHaveFocus()

    // ArrowUp when focused on first element in list should't do anything
    await user.keyboard('[ArrowUp]')
    expect(screen.getByRole('option', {name: 'milestone 0'})).toHaveFocus()

    await user.keyboard('[ArrowDown]')
    expect(screen.getByRole('option', {name: 'milestone 1'})).toHaveFocus()
    await user.keyboard('[ArrowDown]')
    expect(screen.getByRole('option', {name: 'milestone 2'})).toHaveFocus()

    // ArrowDown after last element in list should't do anything
    await user.keyboard('[ArrowDown]')
    expect(screen.getByRole('option', {name: 'milestone 2'})).toHaveFocus()
  })

  it('Space selects the items inside the list box', async () => {
    const {user} = setup({itemsCount: 3, hasSelectedMilestone: true})

    expect(screen.getByRole('textbox')).toHaveFocus()

    const firstItem = screen.getByRole('option', {name: 'milestone 0'})
    const secondItem = screen.getByRole('option', {name: 'milestone 1'})

    await user.keyboard('[ArrowDown]')
    expect(firstItem).toHaveFocus()
    // selected at first
    expect(firstItem).toHaveAttribute('aria-selected', 'true') // not selected at first
    await user.type(firstItem, '[Space]') // using type instead of keyboard because ActionList checks for keyPress not keyDown
    // pressing space does not unselect the options
    expect(firstItem).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('[ArrowDown]')
    expect(secondItem).toHaveFocus()

    expect(secondItem).toHaveAttribute('aria-selected', 'false')
    await user.type(secondItem, '[Space]')
    expect(secondItem).toHaveAttribute('aria-selected', 'true')
    // only one item should be selected at a time
    expect(firstItem).toHaveAttribute('aria-selected', 'false')
  })
})

describe('ItemPickerMilestones Error handling', () => {
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

  it('should show an error message when the hasError prop is set to true', () => {
    const {environment} = createRelayMockEnvironment()

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ItemPickerMilestonesExampleComponent open hasError />
      </RelayEnvironmentProvider>,
    )

    expect(screen.getByText(/One or more milestones do not exist/i)).toBeInTheDocument()
  })

  it('should show load error panel when the fetch for the repository milestones fails', async () => {
    const {environment} = createRelayMockEnvironment()
    const MockError = new Error('An error occurred')

    // Mock the test query
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation))
    // Mock the list fetch
    environment.mock.queueOperationResolver(() => MockError)

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ItemPickerMilestonesExampleComponentWithQuery />
      </RelayEnvironmentProvider>,
    )
    expect(screen.getByText(/We couldn't load the milestones/i)).toBeInTheDocument()

    // we re-throw errors out of band in order to report them to Sentry
    try {
      await act(() => jest.runAllTimers())
      throw new Error('An error should have been thrown')
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toBe(MockError)
    }
  })

  it('should show an error banner when the fetch for the repository milestones fails with a user search query', async () => {
    const {environment, user} = setup({itemsCount: 3})

    const searchInput = screen.getByTestId('item-picker-search-input')
    await user.type(searchInput, 'hello')
    await act(() => jest.runAllTimers())
    const MockError = new Error('An error occurred')

    await act(async () => {
      environment.mock.rejectMostRecentOperation(() => MockError)
    })

    expect(screen.getByText(/We couldn't load the milestones/i)).toBeInTheDocument()

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
