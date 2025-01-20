import {render} from '@github-ui/react-core/test-utils'
import {screen, waitFor} from '@testing-library/react'

import {ProductDetailsPage} from '../../../routes/stafftools'

import {
  getProductDetailsRoutePayload,
  getProductDetailsWithoutPricingsRoutePayload,
} from '../../../test-utils/mock-data'

describe('Product Details', () => {
  it('Renders with the correct product information', async () => {
    const routePayload = getProductDetailsRoutePayload()
    render(<ProductDetailsPage />, {routePayload})
    const actionsHeader = screen.getByRole('heading', {name: 'Actions'})
    const productsLink = screen.getByRole('link', {name: 'Products'})
    const zuoraIdentifierText = screen.getByText('Zuora usage identifier: actions-zuora-usage-identifier')

    await waitFor(() => expect(actionsHeader).toBeInTheDocument())
    await waitFor(() => expect(productsLink).toBeInTheDocument())
    await waitFor(() => expect(zuoraIdentifierText).toBeInTheDocument())
  })

  it('Renders with the list of available SKU pricings', async () => {
    const routePayload = getProductDetailsRoutePayload()
    render(<ProductDetailsPage />, {routePayload})
    const skuHeading = screen.getByRole('heading', {name: 'SKU pricings'})
    const skuCountText = screen.getByText('SKU count: 2')
    const pricingsTable = screen.queryByTestId('pricings-table')
    const linuxSkuLink = screen.getByRole('button', {name: 'linux 4 core'})
    const windowsSkuLink = screen.getByRole('button', {name: 'windows 4 core'})

    await waitFor(() => expect(skuHeading).toBeInTheDocument())
    await waitFor(() => expect(skuCountText).toBeInTheDocument())
    await waitFor(() => expect(pricingsTable).toBeInTheDocument())
    await waitFor(() => expect(linuxSkuLink).toBeInTheDocument())
    await waitFor(() => expect(windowsSkuLink).toBeInTheDocument())
  })

  it('Renders just product details and no pricings when there are no pricings', async () => {
    const routePayload = getProductDetailsWithoutPricingsRoutePayload()
    render(<ProductDetailsPage />, {routePayload})
    const skuHeading = screen.getByRole('heading', {name: 'SKU pricings'})
    const skuCountText = screen.getByText('SKU count: 0')
    const pricingsTable = screen.queryByTestId('pricings-table')

    await waitFor(() => expect(skuHeading).toBeInTheDocument())
    await waitFor(() => expect(skuCountText).toBeInTheDocument())
    await waitFor(() => expect(pricingsTable).not.toBeInTheDocument())
  })

  test('Render Pagination', () => {
    const routePayload = getProductDetailsRoutePayload()
    render(<ProductDetailsPage />, {routePayload})
    expect(screen.queryByText('previous')).toBeNull()
  })
})
