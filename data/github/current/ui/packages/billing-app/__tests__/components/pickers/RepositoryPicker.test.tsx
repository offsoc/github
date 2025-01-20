import {render} from '@github-ui/react-core/test-utils'
import {ComponentWithPreloadedQueryRef} from '@github-ui/relay-test-utils/RelayComponents'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'
import {act, fireEvent, screen, waitFor, within} from '@testing-library/react'
import {
  RepositoryPicker,
  RepositoryPickerRecentQuery,
  RepositoryPickerInitialQuery,
} from '../../../components/pickers/RepositoryPicker'
import type {RepositoryPickerRecentQuery as RepositoryPickerRecentQueryType} from '../../../components/pickers/__generated__/RepositoryPickerRecentQuery.graphql'
import type {OperationDescriptor} from 'relay-runtime'
import type {PreloadedQuery} from 'react-relay'
import {RelayEnvironmentProvider} from 'react-relay'
import {Suspense} from 'react'
import {noop} from '@github-ui/noop'

interface WrapperPickerProps {
  queryRef: PreloadedQuery<RepositoryPickerRecentQueryType>
  initialSelectedItemIds?: string[]
}

function WrappedSingleRepositoryPicker({initialSelectedItemIds, queryRef}: WrapperPickerProps) {
  return (
    <RepositoryPicker
      preloadedRepositoriesRef={queryRef}
      slug="github-inc"
      setSelectedItems={noop}
      initialSelectedItemIds={initialSelectedItemIds ?? []}
      selectionVariant="single"
    />
  )
}

function WrappedMultiRepositoryPicker({initialSelectedItemIds, queryRef}: WrapperPickerProps) {
  return (
    <RepositoryPicker
      preloadedRepositoriesRef={queryRef}
      slug="github-inc"
      setSelectedItems={noop}
      initialSelectedItemIds={initialSelectedItemIds ?? []}
      selectionVariant="multiple"
    />
  )
}

type TestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
  initialSelectedItemIds: string[]
  selectionVariant: 'multiple' | 'single'
}

function TestComponent({environment, initialSelectedItemIds, selectionVariant}: TestComponentProps) {
  const Component = selectionVariant === 'multiple' ? WrappedMultiRepositoryPicker : WrappedSingleRepositoryPicker

  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="...Loading">
        <ComponentWithPreloadedQueryRef
          component={Component}
          componentProps={{initialSelectedItemIds}}
          query={RepositoryPickerRecentQuery}
          queryVariables={{slug: 'github-inc', phrase: ''}}
        />
      </Suspense>
    </RelayEnvironmentProvider>
  )
}

describe('RepositoryPicker tests for creation', () => {
  function SetupAndRenderComponent(selectionVariant: 'multiple' | 'single') {
    const environment = createMockEnvironment()
    environment.mock.queuePendingOperation(RepositoryPickerRecentQuery, {slug: 'github-inc', phrase: ''})
    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      return MockPayloadGenerator.generate(operation, {
        RepositoryConnection() {
          return {
            nodes: [
              {id: 'O_123', nameWithOwner: 'github/foo', isPrivate: true, isArchived: false},
              {id: 'O_234', nameWithOwner: 'github/bar', isPrivate: true, isArchived: false},
              {id: 'O_345', nameWithOwner: 'github/hah', isPrivate: true, isArchived: false},
            ],
            totalCount: 3,
          }
        },
      })
    })

    render(<TestComponent environment={environment} initialSelectedItemIds={[]} selectionVariant={selectionVariant} />)
  }

  test('Shows the default state when empty', async () => {
    SetupAndRenderComponent('multiple')

    const button = screen.getByRole('button', {name: 'Select repositories'})
    expect(button).toBeInTheDocument()

    const repositorySelectedText = screen.queryByText(/0 selected/)
    expect(repositorySelectedText).toBeInTheDocument()
  })

  test('Renders single item select', async () => {
    SetupAndRenderComponent('single')

    const mainButton = screen.getByRole('button', {name: 'Select repository'})

    fireEvent.click(mainButton)

    const checkBoxes = screen.getAllByRole('option')
    fireEvent.click(checkBoxes[0]!)

    const dialog = within(screen.getByRole('dialog'))
    const submitButton = dialog.getByRole('button', {name: 'Select repository'})
    fireEvent.click(submitButton)

    expect(screen.getByText('1 selected')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('github/foo')).toBeInTheDocument()
    })

    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(1)
  })

  test('Cannot select multiple items with single item select', async () => {
    SetupAndRenderComponent('single')

    const mainButton = screen.getByRole('button', {name: 'Select repository'})
    fireEvent.click(mainButton)

    const checkBoxes = screen.getAllByRole('option')
    fireEvent.click(checkBoxes[0]!)
    fireEvent.click(checkBoxes[1]!)

    const dialog = within(screen.getByRole('dialog'))
    const submitButton = dialog.getByRole('button', {name: 'Select repository'})
    fireEvent.click(submitButton)

    expect(screen.getByText('1 selected')).toBeInTheDocument()
    expect(screen.queryByText('foo')).toBeNull()
    expect(screen.getByText('github/bar')).toBeInTheDocument()

    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(1)
  })

  test('Renders multiple item select', async () => {
    SetupAndRenderComponent('multiple')

    const mainButton = screen.getByRole('button', {name: 'Select repositories'})
    fireEvent.click(mainButton)

    const checkBoxes = screen.getAllByRole('option')
    fireEvent.click(checkBoxes[0]!)
    fireEvent.click(checkBoxes[1]!)

    const dialog = within(screen.getByRole('dialog'))
    const submitButton = dialog.getByRole('button', {name: 'Select repositories'})
    fireEvent.click(submitButton)

    expect(screen.getByText('2 selected')).toBeInTheDocument()
    expect(screen.getByText('github/foo')).toBeInTheDocument()
    expect(screen.getByText('github/bar')).toBeInTheDocument()

    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(2)
  })

  // test('Renders all items selected', async () => {
  //   SetupAndRenderComponent('multiple')
  //
  //   const mainButton = screen.getByRole('button', {name: 'Select repository'})
  //
  //   fireEvent.click(mainButton)
  //
  //   const selectAllCheckBox = screen.getByRole('checkbox', {name: 'Select all'})
  //   fireEvent.click(selectAllCheckBox)
  //   expect(screen.getAllByRole('option', {checked: true})).toHaveLength(3)
  //
  //   const dialog = within(screen.getByRole('dialog'))
  //   const submitButton = dialog.getByRole('button', {name: 'Select repository'})
  //   fireEvent.click(submitButton)
  //
  //   expect(screen.getByText('All (3) selected')).toBeInTheDocument()
  //
  //   expect(screen.queryByRole('list')).not.toBeInTheDocument()
  // })

  test('Removing selected item from parent updates the dialog state', async () => {
    SetupAndRenderComponent('multiple')

    const mainButton = screen.getByRole('button', {name: 'Select repositories'})

    fireEvent.click(mainButton)

    const checkBoxes = screen.getAllByRole('option')
    fireEvent.click(checkBoxes[0]!)
    fireEvent.click(checkBoxes[1]!)

    const dialog = within(screen.getByRole('dialog'))
    const submitButton = dialog.getByRole('button', {name: 'Select repositories'})
    fireEvent.click(submitButton)

    const item = within(screen.getByRole('list')).getAllByRole('listitem')[0]!
    const itemDeleteButton = within(item).getByRole('button')
    fireEvent.click(itemDeleteButton)

    fireEvent.click(mainButton)
    expect(screen.getAllByRole('option', {checked: true})).toHaveLength(1)
  })

  test('Does not update any state if the dialog is dismissed', async () => {
    SetupAndRenderComponent('multiple')

    const mainButton = screen.getByRole('button', {name: 'Select repositories'})

    fireEvent.click(mainButton)

    const checkBoxes = screen.getAllByRole('option')
    fireEvent.click(checkBoxes[0]!)

    const dialog = within(screen.getByRole('dialog'))
    const closeButton = dialog.getByRole('button', {name: 'Close'})
    fireEvent.click(closeButton)

    const repositorySelectedText = screen.queryByText(/repository.* selected/)
    expect(repositorySelectedText).not.toBeInTheDocument()
  })
})

describe('RepositoryPicker tests for updating', () => {
  function SetupAndRenderComponent(selectionVariant: 'multiple' | 'single') {
    const environment = createMockEnvironment()
    environment.mock.queuePendingOperation(RepositoryPickerRecentQuery, {slug: 'github-inc', phrase: ''})
    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      return MockPayloadGenerator.generate(operation, {
        RepositoryConnection() {
          return {
            nodes: [
              {id: 'O_123', nameWithOwner: 'github/foo', isPrivate: true, isArchived: false},
              {id: 'O_234', nameWithOwner: 'github/bar', isPrivate: true, isArchived: false},
              {id: 'O_345', nameWithOwner: 'github/hah', isPrivate: true, isArchived: false},
            ],
            totalCount: 3,
          }
        },
      })
    })

    environment.mock.queuePendingOperation(RepositoryPickerInitialQuery, {ids: ['O_123']})
    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      return MockPayloadGenerator.generate(operation, {
        Query() {
          return {id: 'O_123', nameWithOwner: 'github/foo', isPrivate: true, isArchived: false}
        },
      })
    })

    render(
      <TestComponent environment={environment} initialSelectedItemIds={['1']} selectionVariant={selectionVariant} />,
    )
  }

  test('Renders with the preselected item', async () => {
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(() => {
      SetupAndRenderComponent('multiple')
    })

    const button = screen.getByRole('button', {name: 'Select repositories'})
    expect(button).toBeInTheDocument()

    const repositorySelectedText = screen.queryByText(/1 selected/)
    expect(repositorySelectedText).toBeInTheDocument()
  })
})
