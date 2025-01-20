import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen, within} from '@testing-library/react'
import {SkuPicker} from '../../../components/pickers/SkuPicker'
import {noop} from '@github-ui/noop'

jest.mock('../../../hooks/pricing/use-pricings', () => ({
  __esModule: true,
  default: jest.fn(() => {
    return {
      pricings: [
        {sku: 'linux_4_core', friendlyName: 'Actions Linux 4 Core'},
        {sku: 'windows_4_core', friendlyName: 'Actions Windows 4 Core'},
      ],
    }
  }),
}))

type TestComponentProps = {
  selectionVariant: 'multiple' | 'single'
}

function WrappedSingleSkuPicker() {
  return <SkuPicker setSelectedItems={noop} selectionVariant="single" />
}

function WrappedMultiSkuPicker() {
  return <SkuPicker setSelectedItems={noop} selectionVariant="multiple" />
}

function TestComponent({selectionVariant}: TestComponentProps) {
  const Component = selectionVariant === 'multiple' ? WrappedMultiSkuPicker : WrappedSingleSkuPicker

  return <Component />
}

function SetupAndRenderComponent(selectionVariant: 'multiple' | 'single') {
  render(<TestComponent selectionVariant={selectionVariant} />)
}

test('Shows the default state when empty', async () => {
  SetupAndRenderComponent('multiple')

  const button = screen.getByRole('button', {name: 'Select SKUs'})
  expect(button).toBeInTheDocument()

  const skuSelectedText = screen.queryByText(/0 selected/)
  expect(skuSelectedText).toBeInTheDocument()
})

test('Renders single item select', async () => {
  SetupAndRenderComponent('single')

  const mainButton = screen.getByRole('button', {name: 'Select SKU'})

  fireEvent.click(mainButton)

  const checkBoxes = screen.getAllByRole('option')
  fireEvent.click(checkBoxes[0]!)

  const dialog = within(screen.getByRole('dialog'))
  const submitButton = dialog.getByRole('button', {name: 'Select SKU'})
  fireEvent.click(submitButton)

  expect(screen.getByText('1 selected')).toBeInTheDocument()
  expect(screen.getByText('linux_4_core')).toBeInTheDocument()

  const items = within(screen.getByRole('list')).getAllByRole('listitem')
  expect(items).toHaveLength(1)
})

test('Cannot select multiple items with single item select', async () => {
  SetupAndRenderComponent('single')

  const mainButton = screen.getByRole('button', {name: 'Select SKU'})

  fireEvent.click(mainButton)

  const checkBoxes = screen.getAllByRole('option')
  fireEvent.click(checkBoxes[0]!)
  fireEvent.click(checkBoxes[1]!)

  const dialog = within(screen.getByRole('dialog'))
  const submitButton = dialog.getByRole('button', {name: 'Select SKU'})
  fireEvent.click(submitButton)

  expect(screen.getByText('1 selected')).toBeInTheDocument()
  expect(screen.queryByText('foo')).toBeNull()
  expect(screen.getByText('windows_4_core')).toBeInTheDocument()

  const items = within(screen.getByRole('list')).getAllByRole('listitem')
  expect(items).toHaveLength(1)
})

test('Renders multiple item select', async () => {
  SetupAndRenderComponent('multiple')

  const mainButton = screen.getByRole('button', {name: 'Select SKUs'})

  fireEvent.click(mainButton)

  const checkBoxes = screen.getAllByRole('option')
  fireEvent.click(checkBoxes[0]!)
  fireEvent.click(checkBoxes[1]!)

  const dialog = within(screen.getByRole('dialog'))
  const submitButton = dialog.getByRole('button', {name: 'Select SKUs'})
  fireEvent.click(submitButton)

  expect(screen.getByText('2 selected')).toBeInTheDocument()
  expect(screen.getByText('linux_4_core')).toBeInTheDocument()
  expect(screen.getByText('windows_4_core')).toBeInTheDocument()

  const items = within(screen.getByRole('list')).getAllByRole('listitem')
  expect(items).toHaveLength(2)
})

// test('Renders all items selected', async () => {
//   SetupAndRenderComponent('multiple')
//
//   const mainButton = screen.getByRole('button', {name: 'Select SKU'})
//
//   fireEvent.click(mainButton)
//
//   const selectAllCheckBox = screen.getByRole('checkbox', {name: 'Select all'})
//   fireEvent.click(selectAllCheckBox)
//   expect(screen.getAllByRole('option', {checked: true})).toHaveLength(3)
//
//   const dialog = within(screen.getByRole('dialog'))
//   const submitButton = dialog.getByRole('button', {name: 'Select SKU'})
//   fireEvent.click(submitButton)
//
//   expect(screen.getByText('All (3) selected')).toBeInTheDocument()
//
//   expect(screen.queryByRole('list')).not.toBeInTheDocument()
// })

test('Removing selected item from parent updates the dialog state', async () => {
  SetupAndRenderComponent('multiple')

  const mainButton = screen.getByRole('button', {name: 'Select SKUs'})

  fireEvent.click(mainButton)

  const checkBoxes = screen.getAllByRole('option')
  fireEvent.click(checkBoxes[0]!)
  fireEvent.click(checkBoxes[1]!)

  const dialog = within(screen.getByRole('dialog'))
  const submitButton = dialog.getByRole('button', {name: 'Select SKUs'})
  fireEvent.click(submitButton)

  const item = within(screen.getByRole('list')).getAllByRole('listitem')[0]!
  const itemDeleteButton = within(item).getByRole('button')
  fireEvent.click(itemDeleteButton)

  fireEvent.click(mainButton)
  expect(screen.getAllByRole('option', {checked: true})).toHaveLength(1)
})

test('Does not update any state if the dialog is dismissed', async () => {
  SetupAndRenderComponent('multiple')

  const mainButton = screen.getByRole('button', {name: 'Select SKUs'})

  fireEvent.click(mainButton)

  const checkBoxes = screen.getAllByRole('option')
  fireEvent.click(checkBoxes[0]!)

  const dialog = within(screen.getByRole('dialog'))
  const closeButton = dialog.getByRole('button', {name: 'Close'})
  fireEvent.click(closeButton)

  const skuSelectedText = screen.queryByText(/SKU.* selected/)
  expect(skuSelectedText).not.toBeInTheDocument()
})
