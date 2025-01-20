import {render} from '@github-ui/react-core/test-utils'
import {RelayEnvironmentProvider} from 'react-relay'
import {createMockEnvironment} from 'relay-test-utils'
import {screen} from '@testing-library/react'
import {GITHUB_INC_CUSTOMER, MOCK_PRODUCTS} from '../../../../test-utils/mock-data'
import type {Customer} from '../../../../types/common'
import type {Product} from '../../../../types/products'
import {DiscountTargetSelector} from '../../../../components/stafftools/discounts/DiscountTargetSelector'
import {CustomerType, DiscountTarget} from '../../../../enums'

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

type TestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
  customer?: Customer
  discountTarget: DiscountTarget
  discountTargetIds?: string[]
  discountTargetValid?: boolean
  discountTargetIdsValid?: boolean
  enabledProducts?: Product[]
  setDiscountTarget?: (discountTarget: DiscountTarget) => void
  setDiscountTargetIds?: (discountTargetIds: string[]) => void
}

function TestComponent({
  environment,
  customer = GITHUB_INC_CUSTOMER,
  discountTarget,
  discountTargetIds = [],
  discountTargetIdsValid = true,
  discountTargetValid = true,
  enabledProducts = MOCK_PRODUCTS,
  setDiscountTarget = jest.fn,
  setDiscountTargetIds = jest.fn,
}: TestComponentProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <DiscountTargetSelector
        customer={customer}
        discountTarget={discountTarget}
        discountTargetIds={discountTargetIds}
        discountTargetIdsValid={discountTargetIdsValid}
        discountTargetValid={discountTargetValid}
        enabledProducts={enabledProducts}
        setDiscountTarget={setDiscountTarget}
        setDiscountTargetIds={setDiscountTargetIds}
      />
    </RelayEnvironmentProvider>
  )
}

describe('DiscountTargetSelector', () => {
  beforeEach(() => {
    const url = 'https://github.localhost'
    Object.defineProperty(window, 'location', {
      value: {
        href: url,
      },
      writable: true, // possibility to override
    })
  })

  test('Renders for an enterprise customer', async () => {
    const environment = createMockEnvironment()
    render(
      <TestComponent
        environment={environment}
        customer={GITHUB_INC_CUSTOMER}
        discountTarget={DiscountTarget.Enterprise}
      />,
    )

    expect(screen.getByLabelText('Enterprise')).toBeInTheDocument()
    expect(screen.getByLabelText('Enterprise')).toBeChecked()
    expect(screen.getByLabelText('Organization')).toBeInTheDocument()
    expect(screen.getByLabelText('Repository')).toBeInTheDocument()
    expect(screen.getByLabelText('Product')).toBeInTheDocument()
    expect(screen.getByLabelText('SKU')).toBeInTheDocument()
  })

  test('Renders for an organization customer', async () => {
    const environment = createMockEnvironment()
    render(
      <TestComponent
        environment={environment}
        customer={{
          ...GITHUB_INC_CUSTOMER,
          customerType: CustomerType.Organization,
        }}
        discountTarget={DiscountTarget.Repository}
      />,
    )

    expect(screen.queryByLabelText('Enterprise')).toBeNull()
    expect(screen.queryByLabelText('Organization')).toBeNull()
    expect(screen.getByLabelText('Repository')).toBeInTheDocument()
    expect(screen.getByLabelText('Repository')).toBeChecked()
    expect(screen.getByLabelText('Product')).toBeInTheDocument()
    expect(screen.getByLabelText('SKU')).toBeInTheDocument()
  })

  test('Renders for an individual customer', async () => {
    const environment = createMockEnvironment()
    render(
      <TestComponent
        environment={environment}
        customer={{
          ...GITHUB_INC_CUSTOMER,
          customerType: CustomerType.User,
        }}
        discountTarget={DiscountTarget.Product}
      />,
    )

    expect(screen.queryByLabelText('Enterprise')).toBeNull()
    expect(screen.queryByLabelText('Organization')).toBeNull()
    expect(screen.queryByLabelText('Repository')).toBeNull()
    expect(screen.getByLabelText('Product')).toBeInTheDocument()
    expect(screen.getByLabelText('Product')).toBeChecked()
    expect(screen.getByLabelText('SKU')).toBeInTheDocument()
  })
})
