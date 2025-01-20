import {render} from '@github-ui/react-core/test-utils'
import {screen, waitFor} from '@testing-library/react'

import {getProductsRoutePayload} from '../../../test-utils/mock-data'
import {ProductsPage} from '../../../routes/stafftools'

describe('Products', () => {
  it('Renders when the payload contains multiple products', async () => {
    const routePayload = getProductsRoutePayload()
    render(<ProductsPage />, {routePayload})
    const actions = screen.getByText('Actions')
    const lfs = screen.getByText('Git LFS')
    const packages = screen.queryByText('Packages')
    const productsTable = screen.getByTestId('products-table')

    await waitFor(() => expect(productsTable).toBeInTheDocument())
    await waitFor(() => expect(actions).toBeInTheDocument())
    await waitFor(() => expect(lfs).toBeInTheDocument())
    await waitFor(() => expect(packages).not.toBeInTheDocument())
  })

  it('Renders when the payload contains no products', async () => {
    const routePayload = {products: []}
    render(<ProductsPage />, {routePayload})
    const productsTable = screen.queryByTestId('products-table')

    await waitFor(() => expect(productsTable).not.toBeInTheDocument())
  })

  it('Renders when products payload is undefined', async () => {
    render(<ProductsPage />)
    const productsHeader = screen.getByText('Products')
    const productsTable = screen.queryByTestId('products-table')

    await waitFor(() => expect(productsHeader).toBeInTheDocument())
    await waitFor(() => expect(productsTable).not.toBeInTheDocument())
  })
})
