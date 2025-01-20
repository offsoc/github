import {Button} from '@primer/react'
import {useRef, useState} from 'react'
import {type ItemPickerRepositoriesProps, ItemPickerRepositories} from '../ItemPickerRepositories'
import {Wrapper, render} from '@github-ui/react-core/test-utils'
import {renderRelay} from '@github-ui/relay-test-utils'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import type {ItemPickerRepositoriesList_Query} from '../__generated__/ItemPickerRepositoriesList_Query.graphql'
import {mockRepositoriesResolvers} from './helper'
import {act, screen} from '@testing-library/react'
import {RelayEnvironmentProvider} from 'react-relay'
import {MockPayloadGenerator, createMockEnvironment} from 'relay-test-utils'

type ItemPickerRepositoriesExampleComponentProps = Partial<Pick<ItemPickerRepositoriesProps, 'open' | 'onSubmit'>>

function ItemPickerRepositoriesExampleComponent({onSubmit, ...args}: ItemPickerRepositoriesExampleComponentProps) {
  const repositoriesButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<boolean>(args.open || false)
  return (
    <>
      <Button
        ref={repositoriesButtonRef}
        onClick={() => {
          setOpen(!open)
        }}
      >
        open
      </Button>

      <ItemPickerRepositories title="test-title" open={open} onSubmit={onSubmit} setOpen={setOpen} showTrailingVisual />
    </>
  )
}

const setup = ({
  repositoriesCount,
  ...props
}: {
  repositoriesCount: number
} & ItemPickerRepositoriesExampleComponentProps) => {
  const mockOnSubmit = jest.fn()

  const {relayMockEnvironment, user} = renderRelay<{
    listQuery: ItemPickerRepositoriesList_Query
  }>(() => <ItemPickerRepositoriesExampleComponent open onSubmit={mockOnSubmit} {...props} />, {
    wrapper: Wrapper,
    relay: {
      queries: {
        listQuery: {
          type: 'lazy',
        },
      },
      mockResolvers: mockRepositoriesResolvers(repositoriesCount),
    },
  })

  return {environment: relayMockEnvironment, mockOnSubmit, user}
}

describe('ItemPickerRepositories', () => {
  jest.useFakeTimers()
  it('Renders three repositories', () => {
    setup({repositoriesCount: 3})
    expect(screen.getByText('owner-0/repository-0')).toBeInTheDocument()
    expect(screen.getByText('owner-1/repository-1')).toBeInTheDocument()
    expect(screen.getByText('owner-2/repository-2')).toBeInTheDocument()
  })

  it('Renders loading state', () => {
    const {environment} = createRelayMockEnvironment()

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ItemPickerRepositoriesExampleComponent open />
      </RelayEnvironmentProvider>,
    )

    const loadingState = screen.getAllByTestId('loading-skeleton')
    expect(loadingState[0]).toBeVisible()
  })

  it('Sends the data with project type on submit', async () => {
    const {mockOnSubmit, user} = setup({repositoriesCount: 1})

    // act(() => screen.getAllByRole('option')[0]?.focus())
    act(() => screen.getByRole('option', {name: 'owner-0/repository-0'}).focus())

    await user.keyboard('[Enter]')

    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    expect(mockOnSubmit).toHaveBeenCalledWith({
      additionalInfo: {
        nameWithOwner: 'owner-0/repository-0',
        owner: {avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4'},
      },
      id: '0',
    })
  })
})

describe('ItemPickerRepositories Search', () => {
  jest.useFakeTimers()

  it('Searches server side when user types a query', async () => {
    const environment = createMockEnvironment()

    const {user} = render(
      <RelayEnvironmentProvider environment={environment}>
        <ItemPickerRepositoriesExampleComponent open />
      </RelayEnvironmentProvider>,
    )

    const searchInput = screen.getByTestId('item-picker-repository-search-input')
    await user.type(searchInput, 'test')

    await act(() => jest.runAllTimers())

    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        expect(operation.fragment.node.name).toEqual('ItemPickerRepositoriesSearchList_Query')
        return MockPayloadGenerator.generate(operation)
      })
    })
  })
})

describe('ItemPickerRepositories Error handling', () => {
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

  it('should show load error panel when the fetch for the repositories fails', async () => {
    const environment = createMockEnvironment()
    const MockError = new Error('An error occurred')

    // Mock the list fetch
    environment.mock.queueOperationResolver(() => MockError)

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ItemPickerRepositoriesExampleComponent open />
      </RelayEnvironmentProvider>,
    )

    expect(screen.getByText(/We couldn't load the repositories/)).toBeInTheDocument()

    // we re-throw errors out of band in order to report them to Sentry
    try {
      await act(() => jest.runAllTimers())
      throw new Error('An error should have been thrown')
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toBe(MockError)
    }
  })

  it('should show an error banner when the fetch for the repositories fails with a user search query', async () => {
    const {environment, user} = setup({repositoriesCount: 1})

    const searchInput = screen.getByTestId('item-picker-repository-search-input')
    expect(searchInput).toHaveFocus() // search input should be the first focused element when dialog is opened
    await user.type(searchInput, 'recent')
    act(() => jest.runAllTimers())
    const MockError = new Error('An error occurred')

    await act(async () => {
      environment.mock.rejectMostRecentOperation(() => MockError)
    })

    expect(screen.getByText(/We couldn't load the repositories/)).toBeInTheDocument()

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
