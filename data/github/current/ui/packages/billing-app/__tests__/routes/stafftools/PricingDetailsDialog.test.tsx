import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import PricingDetailsDialog from '../../../routes/stafftools/PricingDetailsDialog'
import type {PricingDetails} from '../../../types/pricings'

function mockPricingDetails(): PricingDetails {
  return {
    sku: 'linux_4_core',
    product: 'actions',
    price: 20,
    meterType: 'Default',
    friendlyName: 'Linux 4 Core',
    azureMeterId: 'some-azure-meter-id',
    freeForPublicRepos: true,
    effectiveDatePrices: [
      {startDate: '2022-01-01', endDate: '2023-01-01', price: 20},
      {startDate: '2021-01-01', endDate: '2022-01-01', price: 18},
    ],
    unitType: 'Minutes',
    effectiveAt: 1689366600,
  }
}

describe('PricingDetailsDialog', () => {
  it('Renders with the correct pricing information', async () => {
    const expectedPricingDetails = mockPricingDetails()
    render(<PricingDetailsDialog pricingDetails={expectedPricingDetails} />)

    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await act(async () => {
      screen.getByText('linux 4 core').click()
    })
    await expect(screen.getByRole('dialog')).toBeVisible()

    let listItem = screen.getByTestId('pricing-sku')
    expect(listItem.childNodes[0]?.textContent).toBe('Pricing SKU:')
    expect(listItem.childNodes[1]?.textContent).toBe(expectedPricingDetails.sku)

    listItem = screen.getByTestId('pricing-friendly-name')
    expect(listItem.childNodes[0]?.textContent).toBe('Pricing friendly name:')
    expect(listItem.childNodes[1]?.textContent).toBe(expectedPricingDetails.friendlyName)

    listItem = screen.getByTestId('pricing-product')
    expect(listItem.childNodes[0]?.textContent).toBe('Product:')
    expect(listItem.childNodes[1]?.textContent).toBe(expectedPricingDetails.product)

    listItem = screen.getByTestId('pricing-public-repo')
    expect(listItem.childNodes[0]?.textContent).toBe('Free for Public Repositories:')
    expect(listItem.childNodes[1]?.textContent).toBe(String(expectedPricingDetails.freeForPublicRepos))

    listItem = screen.getByTestId('pricing-price')
    expect(listItem.childNodes[0]?.textContent).toBe('Price:')
    expect(listItem.childNodes[1]?.textContent).toBe(`$${expectedPricingDetails.price}`)

    listItem = screen.getByTestId('pricing-unit-type')
    expect(listItem.childNodes[0]?.textContent).toBe('Unit type:')
    expect(listItem.childNodes[1]?.textContent).toBe(expectedPricingDetails.unitType)

    listItem = screen.getByTestId('pricing-meter-type')
    expect(listItem.childNodes[0]?.textContent).toBe('Meter type:')
    expect(listItem.childNodes[1]?.textContent).toBe(expectedPricingDetails.meterType)

    listItem = screen.getByTestId('pricing-effective-at')
    expect(listItem.childNodes[0]?.textContent).toBe('Effective at:')
    expect(listItem.childNodes[1]?.textContent).toBe(
      new Date(expectedPricingDetails.effectiveAt * 1000).toLocaleString(),
    )

    listItem = screen.getByTestId('pricing-azure-id')
    expect(listItem.childNodes[0]?.textContent).toBe('Azure meter ID:')
    expect(listItem.childNodes[1]?.textContent).toBe(expectedPricingDetails.azureMeterId)
  })

  it('Renders with the list of available historical prices', async () => {
    const expectedPricingDetails = mockPricingDetails()
    render(<PricingDetailsDialog pricingDetails={expectedPricingDetails} />)

    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await act(async () => {
      screen.getByText('linux 4 core').click()
    })
    await expect(screen.getByRole('dialog')).toBeVisible()

    let listItem = screen.getByTestId('pricing-historical-prices')
    expect(listItem.childNodes[0]?.textContent).toBe('Historical prices:')

    for (let i = 0; i < (expectedPricingDetails.effectiveDatePrices ?? []).length; i++) {
      listItem = screen.getByTestId(`pricing-start-date-${i}`)
      expect(listItem.childNodes[0]?.textContent).toBe('Start date:')
      expect(listItem.childNodes[1]?.textContent).toBe(expectedPricingDetails.effectiveDatePrices?.[i]?.startDate)

      listItem = screen.getByTestId(`pricing-end-date-${i}`)
      expect(listItem.childNodes[0]?.textContent).toBe('End date:')
      expect(listItem.childNodes[1]?.textContent).toBe(expectedPricingDetails.effectiveDatePrices?.[i]?.endDate)

      listItem = screen.getByTestId(`pricing-date-price-${i}`)
      expect(listItem.childNodes[0]?.textContent).toBe('Price:')
      expect(listItem.childNodes[1]?.textContent).toBe(String(expectedPricingDetails.effectiveDatePrices?.[i]?.price))
    }
  })
})
