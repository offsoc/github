import {act, screen} from '@testing-library/react'
import {renderRelay} from '@github-ui/relay-test-utils'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {RelayEnvironmentProvider} from 'react-relay'
import {Button} from '@primer/react'
import {SelectPanel} from '@primer/react/drafts'
import {useRef, useState} from 'react'
import {Wrapper, render} from '@github-ui/react-core/test-utils'
import {graphql} from 'relay-runtime'
import {MockPayloadGenerator} from 'relay-test-utils'

import {mockLabelsResolvers} from './helper'
import {ItemPickerLabels, type ItemPickerLabelsProps} from '../ItemPickerLabels'

import type {ItemPickerLabelsTestQuery as ItemPickerLabelsTestQueryType} from './__generated__/ItemPickerLabelsTestQuery.graphql'
import type {ItemPickerLabelsList_Query} from '../__generated__/ItemPickerLabelsList_Query.graphql'

jest.setTimeout(20_000)

type ItemPickerLabelsExampleComponentProps = Omit<
  ItemPickerLabelsProps,
  'onSubmit' | 'labelsButtonRef' | 'setOpen' | 'title' | 'owner' | 'repo'
> &
  Partial<Pick<ItemPickerLabelsProps, 'onSubmit' | 'owner' | 'repo' | 'title'>>

function ItemPickerLabelsExampleComponent({
  owner = 'owner',
  repo = 'repo name',
  ...args
}: ItemPickerLabelsExampleComponentProps) {
  const labelsButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<boolean>(args.open || false)
  return (
    <>
      <Button
        ref={labelsButtonRef}
        onClick={() => {
          setOpen(!open)
        }}
      >
        open
      </Button>

      <ItemPickerLabels
        title="Apply labels"
        owner={owner}
        repo={repo}
        {...args}
        open={open}
        labelsButtonRef={labelsButtonRef}
        setOpen={setOpen}
      />
    </>
  )
}

const setup = ({
  repoLabelsCount,
  selectedLabelsCount,
  ...props
}: {
  repoLabelsCount: number
  selectedLabelsCount: number
} & ItemPickerLabelsExampleComponentProps) => {
  const mockOnSubmit = jest.fn()

  const {relayMockEnvironment, user} = renderRelay<{
    rootQuery: ItemPickerLabelsTestQueryType
    listQuery: ItemPickerLabelsList_Query
  }>(
    ({queryData}) => (
      <ItemPickerLabelsExampleComponent
        selectedLabelsKey={queryData.rootQuery.repository?.issue?.labels}
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
            query: graphql`
              query ItemPickerLabelsTestQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
                repository(owner: $owner, name: $repo) {
                  issue(number: $number) {
                    labels(first: 20) {
                      ...ItemPickerLabels_SelectedLabelsFragment
                    }
                  }
                }
              }
            `,
            type: 'fragment',
            variables: {owner: 'owner', repo: 'repo', number: 1},
          },
          listQuery: {
            type: 'lazy',
          },
        },
        mockResolvers: mockLabelsResolvers(repoLabelsCount, selectedLabelsCount),
      },
    },
  )

  return {environment: relayMockEnvironment, mockOnSubmit, user}
}

describe('ItemPickerLabels', () => {
  jest.useFakeTimers()

  it('Renders three labels', () => {
    setup({repoLabelsCount: 3, selectedLabelsCount: 0})
    expect(screen.getByText('repo label 0')).toBeInTheDocument()
    expect(screen.getByText('repo label 1')).toBeInTheDocument()
    expect(screen.getByText('repo label 2')).toBeInTheDocument()
  })

  it('Renders loading state', () => {
    const {environment} = createRelayMockEnvironment()

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ItemPickerLabelsExampleComponent open />
      </RelayEnvironmentProvider>,
    )

    const loadingState = screen.getAllByTestId('loading-skeleton')
    expect(loadingState[0]).toBeVisible()
  })

  it('Renders create new label button when search query does not match label', async () => {
    const {user} = setup({repoLabelsCount: 3, selectedLabelsCount: 0, onCreateNewLabel: () => {}})

    const searchInput = screen.getByTestId('item-picker-search-input')
    await user.type(searchInput, 'hello')
    act(() => jest.runAllTimers())
    expect(screen.getByTestId('create-new-label-button')).toBeInTheDocument()
  })

  it('Does not render create new label button when create new label callback is not passed', async () => {
    const {user} = setup({repoLabelsCount: 3, selectedLabelsCount: 0})

    const searchInput = screen.getByTestId('item-picker-search-input')
    await user.type(searchInput, 'hello')
    expect(screen.queryByTestId('create-new-label-button')).not.toBeInTheDocument()
  })

  it('Renders secondary action when consumer passes it to the item picker label component', () => {
    const {environment} = createRelayMockEnvironment()

    const secondaryActionButton = (
      <SelectPanel.SecondaryAction variant="button" data-testid="secondary-action-button">
        Edit labels
      </SelectPanel.SecondaryAction>
    )

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ItemPickerLabelsExampleComponent open secondaryActions={secondaryActionButton} />
      </RelayEnvironmentProvider>,
    )

    expect(screen.getByTestId('secondary-action-button')).toBeInTheDocument()
  })

  it('displays an error when the max number of items is reached', () => {
    setup({repoLabelsCount: 3, selectedLabelsCount: 0, maxSelectableItems: 1})

    act(() => {
      screen.getByText('repo label 0').click()
    })
    expect(screen.getByText('You can select up to 1 label(s).')).toBeInTheDocument()
  })

  it('returns additional data on submit', async () => {
    const {mockOnSubmit} = setup({repoLabelsCount: 3, selectedLabelsCount: 1})

    const label2Button = screen.getByRole('option', {name: 'repo label 2'})
    act(() => {
      label2Button.click()
    })
    const saveButton = screen.getByRole('button', {name: 'Save'})
    act(() => {
      saveButton.click()
    })

    expect(mockOnSubmit.mock.calls[0][0]).toHaveLength(2)
    expect(mockOnSubmit.mock.calls[0][0]).toStrictEqual([
      {
        id: 'node-id-selected-0',
        additionalInfo: {
          color: '000000',
          description: 'selected label description 0',
          name: 'selected label 0',
          nameHTML: 'selected label 0',
        },
      },
      {
        id: 'node-id-repo-2',
        additionalInfo: {
          nameHTML: 'repo label 2',
          color: '2468AC',
          name: 'repo label 2',
          description: 'repo label description 2',
        },
      },
    ])
  })
})

describe('ItemPickerLabels Keyboard interaction tests', () => {
  jest.useFakeTimers()

  it('user can tab between elements when the list is open', async () => {
    const {user} = setup({repoLabelsCount: 3, selectedLabelsCount: 0, onCreateNewLabel: () => {}})

    const searchInput = screen.getByTestId('item-picker-search-input')
    expect(searchInput).toHaveFocus() // search input should be the first focused element when dialog is opened

    // type something in the search input box to render clear input button
    await user.type(searchInput, '0')
    act(() => jest.runAllTimers())

    const clearInputButton = screen.getByRole('button', {name: 'Clear'})
    const cancelButton = screen.getByRole('button', {name: 'Cancel'})
    const saveButton = screen.getByRole('button', {name: 'Save'})
    const closeButton = screen.getByRole('button', {name: 'Close'})
    const createNewLabelButton = screen.getByTestId('create-new-label-button')
    const label0Button = screen.getByRole('option', {name: 'repo label 0'})

    await user.tab({shift: true})
    expect(closeButton).toHaveFocus()
    await user.tab()
    expect(searchInput).toHaveFocus()
    await user.tab()
    expect(clearInputButton).toHaveFocus()
    await user.tab()
    expect(label0Button).toHaveFocus()
    await user.tab()
    expect(createNewLabelButton).toHaveFocus()
    await user.tab()
    expect(cancelButton).toHaveFocus()
    await user.tab()
    expect(saveButton).toHaveFocus()
  })

  it('arrow up/down key to navigate between items in the action list', async () => {
    const {user} = setup({repoLabelsCount: 3, selectedLabelsCount: 0})
    act(() => screen.getByRole('option', {name: 'repo label 0'}).focus())
    expect(screen.getByRole('option', {name: 'repo label 0'})).toHaveFocus()

    // ArrowUp when focused on first element in list should't do anything
    await user.keyboard('[ArrowUp]')
    expect(screen.getByRole('option', {name: 'repo label 0'})).toHaveFocus()

    await user.keyboard('[ArrowDown]')
    expect(screen.getByRole('option', {name: 'repo label 1'})).toHaveFocus()
    await user.keyboard('[ArrowDown]')
    expect(screen.getByRole('option', {name: 'repo label 2'})).toHaveFocus()

    // ArrowDown after last element in list should't do anything
    await user.keyboard('[ArrowDown]')
    expect(screen.getByRole('option', {name: 'repo label 2'})).toHaveFocus()
  })

  it('Space selects the items inside the list box', async () => {
    const {user} = setup({repoLabelsCount: 3, selectedLabelsCount: 0})

    expect(screen.getByRole('textbox')).toHaveFocus()

    const firstItem = screen.getByRole('option', {name: 'repo label 0'})
    const secondItem = screen.getByRole('option', {name: 'repo label 1'})

    await user.keyboard('[ArrowDown]')
    expect(firstItem).toHaveFocus()
    // not selected at first
    expect(firstItem).toHaveAttribute('aria-selected', 'false') // not selected at first
    await user.type(firstItem, '{Space}') // using type instead of keyboard because ActionList checks for keyPress not keyDown
    // pressing space selects the options
    expect(firstItem).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('[ArrowDown]')
    expect(secondItem).toHaveFocus()

    expect(secondItem).toHaveAttribute('aria-selected', 'false')
    await user.type(secondItem, '{Space}')
    expect(secondItem).toHaveAttribute('aria-selected', 'true')
  })
})

describe('ItemPickerLabels Search', () => {
  it('should not duplicate selected labels in the unselected labels portion upon initial render', async () => {
    setup({repoLabelsCount: 3, selectedLabelsCount: 3})

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(6)
    expect(options[0]).toHaveTextContent('selected label 0')
    expect(options[1]).toHaveTextContent('selected label 1')
    expect(options[2]).toHaveTextContent('selected label 2')
    expect(options[3]).toHaveTextContent('label 0')
    expect(options[4]).toHaveTextContent('label 1')
    expect(options[5]).toHaveTextContent('label 2')
  })

  it('Searches server side when total labels are more than the pagination limit', async () => {
    const {environment, user} = setup({repoLabelsCount: 60, selectedLabelsCount: 0})

    const searchInput = screen.getByTestId('item-picker-search-input')

    await user.type(searchInput, 'test')

    act(() => jest.runAllTimers())

    const searchSpinner = screen.getByTestId('item-picker-search-loading')
    expect(searchSpinner).toBeVisible()

    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        expect(operation.fragment.node.name).toEqual('ItemPickerLabelsList_Query')
        return MockPayloadGenerator.generate(operation)
      })
    })

    expect(searchSpinner).not.toBeVisible()
  })

  it('Only searches client side when total labels are less than the pagination limit', async () => {
    const {environment, user} = setup({repoLabelsCount: 10, selectedLabelsCount: 0})

    const searchInput = screen.getByTestId('item-picker-search-input')
    await user.type(searchInput, 'test')

    act(() => jest.runAllTimers())
    await act(async () => {
      const operation = environment.mock.getMostRecentOperation()
      expect(operation.fragment.node.name).not.toEqual('ItemPickerLabelsList_Query')
    })
  })

  it('correctly filters labels when searching', async () => {
    const {user} = setup({repoLabelsCount: 10, selectedLabelsCount: 0})
    const searchInput = screen.getByTestId('item-picker-search-input')
    await user.type(searchInput, '1')

    act(() => jest.runAllTimers())
    expect(screen.getByText('repo label 1')).toBeInTheDocument()
    expect(screen.queryByText('repo label 2')).not.toBeInTheDocument()
  })

  it('should filter out selected labels when searching', async () => {
    const {user} = setup({repoLabelsCount: 3, selectedLabelsCount: 1})

    const searchInput = screen.getByTestId('item-picker-search-input')
    await user.type(searchInput, 'label 0')

    act(() => jest.runAllTimers())

    expect(screen.queryByText(/label 2/)).not.toBeInTheDocument()
  })
})

describe('ItemPickerLabels Error handling', () => {
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
        <ItemPickerLabelsExampleComponent open hasError />
      </RelayEnvironmentProvider>,
    )

    expect(screen.getByText(/One or more labels do not exist/i)).toBeInTheDocument()
  })

  it('should show the correct error when the fetch for the repo labels fails', async () => {
    const {environment} = createRelayMockEnvironment()
    const MockError = new Error('An error occurred')

    // Mock the list fetch
    environment.mock.queueOperationResolver(() => MockError)

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ItemPickerLabelsExampleComponent open />
      </RelayEnvironmentProvider>,
    )

    expect(screen.getByText(/We couldn't load the labels/i)).toBeInTheDocument()

    // we re-throw errors out of band in order to report them to Sentry
    try {
      await act(() => jest.runAllTimers())
      throw new Error('An error should have been thrown')
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toBe(MockError)
    }
  })

  it('should show an error banner when the fetch for the repo labels fails with a user search query', async () => {
    const {environment, user} = setup({repoLabelsCount: 60, selectedLabelsCount: 1})
    expect(screen.getByRole('option', {name: 'repo label 0'})).toBeVisible()

    const searchInput = screen.getByTestId('item-picker-search-input')
    await user.type(searchInput, 'hello')
    await act(async () => jest.runAllTimers())
    const MockError = new Error('An error occurred')

    await act(async () => {
      environment.mock.rejectMostRecentOperation(() => MockError)
    })

    expect(screen.getByText(/We couldn't load the labels/i)).toBeInTheDocument()

    // we re-throw errors out of band in order to report them to Sentry
    try {
      await act(async () => jest.runAllTimers())
      throw new Error('An error should have been thrown')
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toBe(MockError)
    }
  })
})

describe('ItemPickerLabels Shortcut', () => {
  it('should open panel and focus on the search input when the "l" key is pressed', async () => {
    const {user} = setup({repoLabelsCount: 10, selectedLabelsCount: 0, open: false})

    await user.keyboard('l')

    const searchInput = screen.getByTestId('item-picker-search-input')
    expect(searchInput).toHaveFocus()
    expect(searchInput).toHaveValue('')
  })
  it('should reopen panel and focus on the search input when the "l" key is pressed after closing panel', async () => {
    const {user} = setup({repoLabelsCount: 10, selectedLabelsCount: 0, open: false})

    await user.keyboard('l')
    await user.keyboard('{Escape}')
    await user.keyboard('l')

    const searchInput = screen.getByTestId('item-picker-search-input')
    expect(searchInput).toHaveFocus()
  })

  it('should not open panel when the "l" key is pressed and shortcuts are disabled', async () => {
    const {user} = setup({repoLabelsCount: 10, selectedLabelsCount: 0, open: false, shortcutEnabled: false})

    await user.keyboard('l')

    expect(screen.queryByTestId('item-picker-search-input')).not.toBeInTheDocument()
  })

  it('should not open panel when other shortcut keys are pressed', async () => {
    const {user} = setup({repoLabelsCount: 10, selectedLabelsCount: 0, open: false, shortcutEnabled: false})

    await user.keyboard('p m a d')

    expect(screen.queryByTestId('item-picker-search-input')).not.toBeInTheDocument()
  })

  it('should not trigger shortcut when panel is already open and the "l" key is pressed', async () => {
    const {user} = setup({repoLabelsCount: 10, selectedLabelsCount: 0, open: false})

    await user.keyboard('l')

    await user.keyboard('llama')

    const searchInput = screen.getByTestId('item-picker-search-input')
    expect(searchInput).toHaveValue('llama')
  })
})
