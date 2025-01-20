import {render} from '@github-ui/react-core/test-utils'
import {ComponentWithPreloadedQueryRef} from '@github-ui/relay-test-utils/RelayComponents'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'
import {act, fireEvent, screen, within} from '@testing-library/react'
import {
  OrganizationPicker,
  OrganizationPickerRecentQuery,
  OrganizationPickerInitialQuery,
} from '../../../components/pickers/OrganizationPicker'
import type {OrganizationPickerRecentQuery as OrganizationPickerRecentQueryType} from '../../../components/pickers/__generated__/OrganizationPickerRecentQuery.graphql'
import type {OperationDescriptor} from 'relay-runtime'
import type {PreloadedQuery} from 'react-relay'
import {RelayEnvironmentProvider} from 'react-relay'
import {Suspense} from 'react'
import {noop} from '@github-ui/noop'

interface WrapperPickerProps {
  queryRef: PreloadedQuery<OrganizationPickerRecentQueryType>
  initialSelectedItemIds?: string[]
}

function WrappedSingleOrganizationPicker({initialSelectedItemIds, queryRef}: WrapperPickerProps) {
  return (
    <OrganizationPicker
      preloadedOrganizationsRef={queryRef}
      slug="github-inc"
      setSelectedItems={noop}
      initialSelectedItemIds={initialSelectedItemIds ?? []}
      selectionVariant="single"
    />
  )
}

function WrappedMultiOrganizationPicker({initialSelectedItemIds, queryRef}: WrapperPickerProps) {
  return (
    <OrganizationPicker
      preloadedOrganizationsRef={queryRef}
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
  const Component = selectionVariant === 'multiple' ? WrappedMultiOrganizationPicker : WrappedSingleOrganizationPicker

  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="...Loading">
        <ComponentWithPreloadedQueryRef
          component={Component}
          componentProps={{initialSelectedItemIds}}
          query={OrganizationPickerRecentQuery}
          queryVariables={{slug: 'github-inc', query: ''}}
        />
      </Suspense>
    </RelayEnvironmentProvider>
  )
}

describe('OrganizationPicker tests for creation', () => {
  function SetupAndRenderComponent(selectionVariant: 'multiple' | 'single') {
    const environment = createMockEnvironment()
    environment.mock.queuePendingOperation(OrganizationPickerRecentQuery, {slug: 'github-inc', query: ''})
    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      return MockPayloadGenerator.generate(operation, {
        OrganizationConnection() {
          return {
            nodes: [
              {id: 'O_123', login: 'foo', avatarUrl: 'github.localhost'},
              {id: 'O_234', login: 'bar', avatarUrl: 'github.localhost'},
              {id: 'O_345', login: 'hah', avatarUrl: 'github.localhost'},
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

    const button = screen.getByRole('button', {name: 'Select organizations'})
    expect(button).toBeInTheDocument()

    const organizationSelectedText = screen.queryByText(/0 selected/)
    expect(organizationSelectedText).toBeInTheDocument()
  })

  test('Renders single item select', async () => {
    SetupAndRenderComponent('single')

    const mainButton = screen.getByRole('button', {name: 'Select organization'})

    fireEvent.click(mainButton)

    const checkBoxes = screen.getAllByRole('option')
    fireEvent.click(checkBoxes[0]!)

    const dialog = within(screen.getByRole('dialog'))
    const submitButton = dialog.getByRole('button', {name: 'Select organization'})
    fireEvent.click(submitButton)

    expect(screen.getByText('1 selected')).toBeInTheDocument()
    expect(screen.getByText('foo')).toBeInTheDocument()

    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(1)
  })

  test('Cannot select multiple items with single item select', async () => {
    SetupAndRenderComponent('single')

    const mainButton = screen.getByRole('button', {name: 'Select organization'})

    fireEvent.click(mainButton)

    const checkBoxes = screen.getAllByRole('option')
    fireEvent.click(checkBoxes[0]!)
    fireEvent.click(checkBoxes[1]!)

    const dialog = within(screen.getByRole('dialog'))
    const submitButton = dialog.getByRole('button', {name: 'Select organization'})
    fireEvent.click(submitButton)

    expect(screen.getByText('1 selected')).toBeInTheDocument()
    expect(screen.queryByText('foo')).toBeNull()
    expect(screen.getByText('bar')).toBeInTheDocument()

    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(1)
  })

  test('Renders multiple item select', async () => {
    SetupAndRenderComponent('multiple')

    const mainButton = screen.getByRole('button', {name: 'Select organizations'})

    fireEvent.click(mainButton)

    const checkBoxes = screen.getAllByRole('option')
    fireEvent.click(checkBoxes[0]!)
    fireEvent.click(checkBoxes[1]!)

    const dialog = within(screen.getByRole('dialog'))
    const submitButton = dialog.getByRole('button', {name: 'Select organizations'})
    fireEvent.click(submitButton)

    expect(screen.getByText('2 selected')).toBeInTheDocument()
    expect(screen.getByText('foo')).toBeInTheDocument()
    expect(screen.getByText('bar')).toBeInTheDocument()

    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(2)
  })

  // test('Renders all items selected', async () => {
  //   SetupAndRenderComponent('multiple')
  //
  //   const mainButton = screen.getByRole('button', {name: 'Select organization'})
  //
  //   fireEvent.click(mainButton)
  //
  //   const selectAllCheckBox = screen.getByRole('checkbox', {name: 'Select all'})
  //   fireEvent.click(selectAllCheckBox)
  //   expect(screen.getAllByRole('option', {checked: true})).toHaveLength(3)
  //
  //   const dialog = within(screen.getByRole('dialog'))
  //   const submitButton = dialog.getByRole('button', {name: 'Select organization'})
  //   fireEvent.click(submitButton)
  //
  //   expect(screen.getByText('All (3) selected')).toBeInTheDocument()
  //
  //   expect(screen.queryByRole('list')).not.toBeInTheDocument()
  // })

  test('Removing selected item from parent updates the dialog state', async () => {
    SetupAndRenderComponent('multiple')

    const mainButton = screen.getByRole('button', {name: 'Select organizations'})

    fireEvent.click(mainButton)

    const checkBoxes = screen.getAllByRole('option')
    fireEvent.click(checkBoxes[0]!)
    fireEvent.click(checkBoxes[1]!)

    const dialog = within(screen.getByRole('dialog'))
    const submitButton = dialog.getByRole('button', {name: 'Select organizations'})
    fireEvent.click(submitButton)

    const item = within(screen.getByRole('list')).getAllByRole('listitem')[0]!
    const itemDeleteButton = within(item).getByRole('button')
    fireEvent.click(itemDeleteButton)

    fireEvent.click(mainButton)
    expect(screen.getAllByRole('option', {checked: true})).toHaveLength(1)
  })

  test('Does not update any state if the dialog is dismissed', async () => {
    SetupAndRenderComponent('multiple')

    const mainButton = screen.getByRole('button', {name: 'Select organizations'})

    fireEvent.click(mainButton)

    const checkBoxes = screen.getAllByRole('option')
    fireEvent.click(checkBoxes[0]!)

    const dialog = within(screen.getByRole('dialog'))
    const closeButton = dialog.getByRole('button', {name: 'Close'})
    fireEvent.click(closeButton)

    const organizationSelectedText = screen.queryByText(/organization.* selected/)
    expect(organizationSelectedText).not.toBeInTheDocument()
  })
})

describe('OrganizationPicker tests for updating', () => {
  function SetupAndRenderComponent(selectionVariant: 'multiple' | 'single') {
    const environment = createMockEnvironment()
    environment.mock.queuePendingOperation(OrganizationPickerRecentQuery, {slug: 'github-inc', query: ''})
    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      return MockPayloadGenerator.generate(operation, {
        OrganizationConnection() {
          return {
            nodes: [
              {id: 'O_123', login: 'foo', avatarUrl: 'github.localhost'},
              {id: 'O_234', login: 'bar', avatarUrl: 'github.localhost'},
              {id: 'O_345', login: 'hah', avatarUrl: 'github.localhost'},
            ],
            totalCount: 3,
          }
        },
      })
    })

    environment.mock.queuePendingOperation(OrganizationPickerInitialQuery, {ids: ['O_123']})
    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      return MockPayloadGenerator.generate(operation, {
        Query() {
          return {id: 'O_123', login: 'foo', avatarUrl: 'github.localhost'}
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

    const button = screen.getByRole('button', {name: 'Select organizations'})
    expect(button).toBeInTheDocument()

    const organizationSelectedText = screen.queryByText(/1 selected/)
    expect(organizationSelectedText).toBeInTheDocument()
  })
})
