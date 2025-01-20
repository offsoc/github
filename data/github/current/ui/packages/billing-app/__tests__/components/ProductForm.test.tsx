import {render} from '@github-ui/react-core/test-utils'
import {screen, waitFor, act} from '@testing-library/react'
import {mockFetch} from '@github-ui/mock-fetch'

import {ProductForm} from '../../components/products/ProductForm'
import {URLS} from '../../constants'

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

test('Renders correctly for adding a new product', async () => {
  render(<ProductForm action="create" />)

  const button = await screen.findByRole('button', {name: 'Create product'})
  const heading = await screen.findByRole('heading', {name: 'Create a new product'})

  expect(button).toBeInTheDocument()
  expect(heading).toBeInTheDocument()
})

test('Renders correctly for editing a product', async () => {
  const product = {name: 'actions', friendlyProductName: 'Actions'}
  render(<ProductForm action="edit" initialValues={product} />)

  const button = await screen.findByRole('button', {name: 'Edit product'})
  const heading = await screen.findByRole('heading', {name: `Update ${product.friendlyProductName}`})

  expect(button).toBeInTheDocument()
  expect(heading).toBeInTheDocument()
})

test('Submits the create product form', async () => {
  const {user} = render(<ProductForm action="create" />)

  const nameInput = screen.getByRole('textbox', {name: 'Name'})
  const friendlyNameInput = screen.getByRole('textbox', {name: 'Friendly product name'})
  const zuoraInput = screen.getByRole('textbox', {name: 'Zuora usage identifier'})
  const submitButton = screen.getByRole('button', {name: 'Create product'})
  const mock = mockFetch.mockRoute(URLS.STAFFTOOLS_PRODUCTS)

  await user.type(nameInput, 'actions')
  await user.type(friendlyNameInput, 'Actions')
  await user.type(zuoraInput, 'abc123')
  await user.click(submitButton)

  const dialogButton = screen.getByRole('button', {name: 'Continue'})
  expect(dialogButton).toBeInTheDocument()
  await user.click(dialogButton)

  await act(async () => {
    expect(mock).toHaveBeenCalled()
  })
})

test('Does not submit the create product form and shows an error when a required field is empty', async () => {
  const {user} = render(<ProductForm action="create" />)

  const nameInput = screen.getByRole('textbox', {name: 'Name'})
  const submitButton = screen.getByRole('button', {name: 'Create product'})
  const mock = mockFetch.mockRoute(URLS.STAFFTOOLS_PRODUCTS)

  await user.type(nameInput, 'actions')
  await user.click(submitButton)

  const toast = screen.getByRole('alert')

  await waitFor(() => expect(toast).toBeInTheDocument())
  await waitFor(() => expect(toast).toHaveTextContent('Please complete required fields to continue.'))
  await act(async () => {
    expect(mock).not.toHaveBeenCalled()
  })
})

test('Submits the edit product form', async () => {
  const product = {name: 'actions', friendlyProductName: 'Actions', zuoraUsageIdentifier: 'abc123'}
  const updatedFriendlyName = 'GitHub Actions'
  const {user} = render(<ProductForm action="edit" initialValues={product} />)

  const friendlyNameInput = await screen.findByRole('textbox', {name: 'Friendly product name'})
  const submitButton = await screen.findByRole('button', {name: 'Edit product'})
  const mock = mockFetch.mockRoute(`${URLS.STAFFTOOLS_PRODUCTS}/actions`)

  await user.clear(friendlyNameInput)
  await user.type(friendlyNameInput, updatedFriendlyName)

  expect(friendlyNameInput).toHaveValue(updatedFriendlyName)

  await user.click(submitButton)

  const dialogButton = screen.getByRole('button', {name: 'Continue'})
  expect(dialogButton).toBeInTheDocument()
  await user.click(dialogButton)

  await act(async () => {
    expect(mock).toHaveBeenCalled()
  })
})

test('Does not submit the edit product form and shows an error when a required field is empty', async () => {
  const product = {name: 'actions', friendlyProductName: 'Actions', zuoraUsageIdentifier: 'abc123'}
  const {user} = render(<ProductForm action="edit" initialValues={product} />)

  const friendlyNameInput = await screen.findByRole('textbox', {name: 'Friendly product name'})
  const submitButton = screen.getByRole('button', {name: 'Edit product'})
  const mock = mockFetch.mockRoute(URLS.STAFFTOOLS_PRODUCTS)

  await user.clear(friendlyNameInput)
  await user.click(submitButton)

  const toast = screen.getByRole('alert')

  await waitFor(() => expect(toast).toBeInTheDocument())
  await waitFor(() => expect(toast).toHaveTextContent('Please complete required fields to continue.'))
  await act(async () => {
    expect(mock).not.toHaveBeenCalled()
  })
})

test('The name input is disabled on the edit product form', async () => {
  const product = {name: 'actions', friendlyProductName: 'Actions'}
  render(<ProductForm action="edit" initialValues={product} />)

  const nameInput = await screen.findByRole('textbox', {name: 'Name'})
  expect(nameInput).toBeDisabled()
})
