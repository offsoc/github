import {mockFetch} from '@github-ui/mock-fetch'
import {render} from '@github-ui/react-core/test-utils'
import {screen, act, within} from '@testing-library/react'
import {RelayEnvironmentProvider} from 'react-relay'
import {createMockEnvironment} from 'relay-test-utils'

import {DiscountForm} from '../../../../components/stafftools/discounts/DiscountForm'
import {GITHUB_INC_CUSTOMER, MOCK_PRODUCTS} from '../../../../test-utils/mock-data'

import type {Customer} from '../../../../types/common'
import type {Product} from '../../../../types/products'

jest.mock('@github-ui/ssr-utils', () => ({
  get ssrSafeLocation() {
    return jest.fn().mockImplementation(() => {
      return {origin: 'https://github.localhost', pathname: '/stafftools/enterprises/github-inc/billing/discounts'}
    })()
  },
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => {
    return {business: 'github-inc'}
  },
}))

jest.mock('../../../../hooks/pricing/use-pricings', () => ({
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
  environment: ReturnType<typeof createMockEnvironment>
  customer: Customer
  enabledProducts?: Product[]
}

function TestComponent({
  environment,
  customer = GITHUB_INC_CUSTOMER,
  enabledProducts = MOCK_PRODUCTS,
}: TestComponentProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <DiscountForm customer={customer} enabledProducts={enabledProducts} />
    </RelayEnvironmentProvider>
  )
}

function SetupAndRenderComponent(customer: Customer, enabledProducts?: Product[]) {
  const environment = createMockEnvironment()

  return render(<TestComponent environment={environment} customer={customer} enabledProducts={enabledProducts} />)
}

describe('DiscountForm', () => {
  beforeEach(() => {
    const url = 'https://github.localhost'
    Object.defineProperty(window, 'location', {
      value: {
        href: url,
      },
      writable: true, // possibility to override
    })
  })

  test('Renders', async () => {
    SetupAndRenderComponent(GITHUB_INC_CUSTOMER)

    await expect(screen.findByRole('heading', {name: 'Apply a new discount'})).resolves.toBeInTheDocument()
    await expect(screen.findByRole('button', {name: 'Create discount'})).resolves.toBeInTheDocument()
  })

  test('Submits and creates an enterprise discount', async () => {
    const {user} = SetupAndRenderComponent(GITHUB_INC_CUSTOMER)

    const mock = mockFetch.mockRoute('/stafftools/enterprises/github-inc/billing/discounts')

    const entRadioBtn: HTMLInputElement = screen.getByLabelText('Enterprise')
    expect(entRadioBtn).toBeChecked()

    const start = new Date()
    const end = new Date()
    end.setDate(start.getDate() + 7)

    const startDateInput: HTMLInputElement = screen.getByLabelText('Start date')
    // Enter YYYY-MM-DD date format
    await user.type(startDateInput, start.toISOString().slice(0, 10))

    const endDateInput: HTMLInputElement = screen.getByLabelText('End date')
    // Enter YYYY-MM-DD date format
    await user.type(endDateInput, end.toISOString().slice(0, 10))

    const discountTypeSelect: HTMLSelectElement = screen.getByLabelText('Discount type')
    await user.selectOptions(discountTypeSelect, 'Percentage')

    const discountAmountInput: HTMLInputElement = screen.getByLabelText('Discount amount')
    await user.type(discountAmountInput, '10')

    const submitBtn = screen.getByRole('button', {name: 'Create discount'})
    await user.click(submitBtn)

    await act(async () => {
      expect(mock).toHaveBeenCalled()
    })
  })

  // TODO: Figure out how to make Org/Repo queries work correctly

  test('Submits and creates a product discount', async () => {
    const {user} = SetupAndRenderComponent(GITHUB_INC_CUSTOMER)

    const mock = mockFetch.mockRoute('/stafftools/enterprises/github-inc/billing/discounts')

    const productRadioBtn: HTMLInputElement = screen.getByLabelText('Product')
    await user.click(productRadioBtn)

    const productSelect: HTMLSelectElement = screen.getByLabelText('Select product')
    await user.selectOptions(productSelect, MOCK_PRODUCTS[0]?.friendlyProductName as string)

    const start = new Date()
    const end = new Date()
    end.setDate(start.getDate() + 7)

    const startDateInput: HTMLInputElement = screen.getByLabelText('Start date')
    // Enter YYYY-MM-DD date format
    await user.type(startDateInput, start.toISOString().slice(0, 10))

    const endDateInput: HTMLInputElement = screen.getByLabelText('End date')
    // Enter YYYY-MM-DD date format
    await user.type(endDateInput, end.toISOString().slice(0, 10))

    const discountTypeSelect: HTMLSelectElement = screen.getByLabelText('Discount type')
    await user.selectOptions(discountTypeSelect, 'Percentage')

    const discountAmountInput: HTMLInputElement = screen.getByLabelText('Discount amount')
    await user.type(discountAmountInput, '10')

    const submitButton = screen.getByRole('button', {name: 'Create discount'})

    await user.click(submitButton)

    await act(async () => {
      expect(mock).toHaveBeenCalled()
    })
  })

  test('Submits and creates a SKU discount', async () => {
    const {user} = SetupAndRenderComponent(GITHUB_INC_CUSTOMER)

    const mock = mockFetch.mockRoute('/stafftools/enterprises/github-inc/billing/discounts')

    const skuRadioBtn: HTMLInputElement = screen.getByLabelText('SKU')
    await user.click(skuRadioBtn)

    const skuSelectBtn: HTMLButtonElement = screen.getByRole('button', {name: 'Select SKU'})
    await user.click(skuSelectBtn)

    const dialog = within(screen.getByRole('dialog'))

    const checkBoxes = dialog.getAllByRole('option')
    await user.click(checkBoxes[0]!)

    const submitSkuBtn = dialog.getByRole('button', {name: 'Select SKU'})
    expect(dialog.getByRole('button', {name: 'Select SKU'})).toBeInTheDocument()

    await user.click(submitSkuBtn)

    expect(screen.getByText('1 selected')).toBeInTheDocument()
    expect(screen.getByText('linux_4_core')).toBeInTheDocument()

    const start = new Date()
    const end = new Date()
    end.setDate(start.getDate() + 7)

    const startDateInput: HTMLInputElement = screen.getByLabelText('Start date')
    // Enter YYYY-MM-DD date format
    await user.type(startDateInput, start.toISOString().slice(0, 10))

    const endDateInput: HTMLInputElement = screen.getByLabelText('End date')
    // Enter YYYY-MM-DD date format
    await user.type(endDateInput, end.toISOString().slice(0, 10))

    const discountTypeSelect: HTMLSelectElement = screen.getByLabelText('Discount type')
    await user.selectOptions(discountTypeSelect, 'Percentage')

    const discountAmountInput: HTMLInputElement = screen.getByLabelText('Discount amount')
    await user.type(discountAmountInput, '10')

    const submitButton = screen.getByRole('button', {name: 'Create discount'})

    await user.click(submitButton)

    await act(async () => {
      expect(mock).toHaveBeenCalled()
    })
  })
})
