import {mockFetch} from '@github-ui/mock-fetch'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen, waitFor} from '@testing-library/react'

import {PricingForm} from '../../components/pricings/PricingForm'

import {URLS} from '../../constants'
import {initialPricingData} from '../../test-utils/mock-data'

// This is necessary to mock because of the soft navigation in the form.
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(),
    mark: jest.fn(),
    clearResourceTimings: jest.fn(),
    getEntriesByName: jest.fn().mockReturnValue({pop: jest.fn()}),
    measure: jest.fn(),
  },
})

test('Renders correctly for adding a new SKU pricing', async () => {
  render(<PricingForm action="create" productId="actions" />)

  const button = await screen.findByRole('button', {name: 'Save SKU pricing'})
  const heading = await screen.findByRole('heading', {name: 'Create a new SKU pricing'})

  expect(button).toBeInTheDocument()
  expect(heading).toBeInTheDocument()
})

test('Submits the create pricing form', async () => {
  const {user} = render(<PricingForm action="create" productId="actions" />)

  const nameInput = screen.getByRole('textbox', {name: 'SKU Name'})
  const friendlyNameInput = screen.getByRole('textbox', {name: 'Friendly SKU name'})
  const priceInput = screen.getByRole('textbox', {name: 'Price'})
  const meterTypeInput = screen.getByRole('combobox', {name: 'Meter type'})
  const azureMeterIdInput = screen.getByRole('textbox', {name: 'Azure Meter ID'})

  const submitButton = screen.getByRole('button', {name: 'Save SKU pricing'})
  const mock = mockFetch.mockRoute(`${URLS.STAFFTOOLS_PRODUCTS}/actions/pricings`)

  await user.type(nameInput, 'linux')
  await user.type(friendlyNameInput, 'Linux')
  await user.type(priceInput, '33')
  await user.selectOptions(meterTypeInput, ['Default'])
  await user.type(azureMeterIdInput, 'abc123')
  await user.click(submitButton)

  const dialogButton = screen.getByRole('button', {name: 'Continue'})
  expect(dialogButton).toBeInTheDocument()
  await user.click(dialogButton)

  await act(async () => {
    expect(mock).toHaveBeenCalled()
  })
})

test('Does not submit the SKU pricing form and shows an error when a required field is empty for the create form', async () => {
  const {user} = render(<PricingForm action="create" productId="actions" />)

  const nameInput = screen.getByRole('textbox', {name: 'SKU Name'})
  const friendlyNameInput = screen.getByRole('textbox', {name: 'Friendly SKU name'})
  const priceInput = screen.getByRole('textbox', {name: 'Price'})

  const submitButton = screen.getByRole('button', {name: 'Save SKU pricing'})
  const mock = mockFetch.mockRoute(`${URLS.STAFFTOOLS_PRODUCTS}/actions/pricings`)

  await user.type(nameInput, 'linux')
  await user.type(friendlyNameInput, 'Linux')
  await user.type(priceInput, '33')
  await user.click(submitButton)

  const toast = screen.getByRole('alert')

  await waitFor(() => expect(toast).toBeInTheDocument())
  await waitFor(() => expect(toast).toHaveTextContent('Please complete required fields to continue.'))
  await act(async () => {
    expect(mock).not.toHaveBeenCalled()
  })
})

test('The product input is pre-filled and disabled for the create form', async () => {
  render(<PricingForm action="create" productId="actions" />)

  const productInput = await screen.findByRole('textbox', {name: 'Product'})
  const actions = screen.getByDisplayValue('actions')

  expect(productInput).toBeDisabled()
  expect(actions).toBeInTheDocument()
})

test('Renders correctly for editing a SKU pricing', async () => {
  render(<PricingForm action="edit" productId="actions" initialValues={initialPricingData} />)

  const button = await screen.findByRole('button', {name: 'Edit SKU pricing'})
  const heading = await screen.findByRole('heading', {name: 'Edit SKU pricing'})

  expect(button).toBeInTheDocument()
  expect(heading).toBeInTheDocument()
})

test('Submits the edit pricing form', async () => {
  const {user} = render(<PricingForm action="edit" productId="actions" initialValues={initialPricingData} />)

  const friendlyNameInput = screen.getByRole('textbox', {name: 'Friendly SKU name'})
  const meterTypeInput = screen.getByRole('combobox', {name: 'Meter type'})
  const submitButton = screen.getByRole('button', {name: 'Edit SKU pricing'})
  const url = `${URLS.STAFFTOOLS_PRODUCTS}/${initialPricingData.product}/pricings/${initialPricingData.sku}`
  const mock = mockFetch.mockRoute(url)

  expect(friendlyNameInput).toHaveValue('Ubuntu 4 Core')

  await user.clear(friendlyNameInput)
  await user.type(friendlyNameInput, 'Linux 4 Core')
  await user.selectOptions(meterTypeInput, ['PerHourUnitCharge'])
  await user.click(submitButton)

  expect(friendlyNameInput).toHaveValue('Linux 4 Core')
  expect(meterTypeInput).toHaveValue('PerHourUnitCharge')

  const dialogButton = screen.getByRole('button', {name: 'Continue'})
  expect(dialogButton).toBeInTheDocument()
  await user.click(dialogButton)

  await act(async () => {
    expect(mock).toHaveBeenCalled()
  })
})

test('Does not submit the edit SKU pricing form and shows an error when a required field is empty', async () => {
  const {user} = render(<PricingForm action="edit" productId="actions" initialValues={initialPricingData} />)

  const friendlyNameInput = screen.getByRole('textbox', {name: 'Friendly SKU name'})
  const submitButton = screen.getByRole('button', {name: 'Edit SKU pricing'})
  const url = `${URLS.STAFFTOOLS_PRODUCTS}/${initialPricingData.product}/pricings/${initialPricingData.sku}`
  const mock = mockFetch.mockRoute(url)

  await user.clear(friendlyNameInput)
  await user.click(submitButton)

  const toast = screen.getByRole('alert')

  await waitFor(() => expect(toast).toBeInTheDocument())
  await waitFor(() => expect(toast).toHaveTextContent('Please complete required fields to continue.'))
  await act(async () => {
    expect(mock).not.toHaveBeenCalled()
  })
})

test('The product and SKU name inputs are pre-filled and disabled for the edit form', async () => {
  render(<PricingForm action="edit" productId="actions" initialValues={initialPricingData} />)

  const productInput = await screen.findByRole('textbox', {name: 'Product'})
  const nameInput = screen.getByRole('textbox', {name: 'SKU Name'})
  const actions = screen.getByDisplayValue('actions')
  const linux4Core = screen.getByDisplayValue('linux_4_core')

  expect(productInput).toBeDisabled()
  expect(nameInput).toBeDisabled()
  expect(actions).toBeInTheDocument()
  expect(linux4Core).toBeInTheDocument()
})
