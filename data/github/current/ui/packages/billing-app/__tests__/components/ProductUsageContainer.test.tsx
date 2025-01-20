import {render} from '@github-ui/react-core/test-utils'
import {screen, waitFor} from '@testing-library/react'

import {ProductUsageContainer} from '../../components/usage/ProductUsageContainer'

import {DEFAULT_FILTERS, GITHUB_INC_CUSTOMER, MOCK_PRODUCTS} from '../../test-utils/mock-data'

describe('ProductUsageContainer', () => {
  test('Renders the products tab when there are products enabled', async () => {
    render(
      <ProductUsageContainer
        customer={GITHUB_INC_CUSTOMER}
        enabledProducts={MOCK_PRODUCTS}
        filters={DEFAULT_FILTERS}
        isOnlyOrgAdmin={false}
      />,
    )

    const productTabs = await screen.findByText('Products selector navigation')
    expect(productTabs).toBeTruthy()

    await waitFor(() => expect(screen.getByTestId('actions-tab')).toHaveTextContent('Actions'))
    await waitFor(() => expect(screen.getByTestId('copilot-tab')).toHaveTextContent('Copilot'))
    await waitFor(() => expect(screen.getByTestId('git_lfs-tab')).toHaveTextContent('Git LFS'))

    await waitFor(() => expect(screen.getByTestId('actions-tab-pane')).toHaveTextContent('Actions'))
    // await waitFor(() => expect(screen.getByTestId('copilot-tab-pane')).toHaveTextContent('Copilot'))
    await waitFor(() => expect(screen.getByTestId('git_lfs-tab-pane')).toHaveTextContent('Git LFS'))

    await waitFor(() => expect(screen.getByTestId('actions-tab').getAttribute('aria-current')).toBeTruthy())
    await waitFor(() => expect(screen.getByTestId('actions-tab-pane').getAttribute('aria-current')).toBeTruthy())
  })

  test('Renders nothing when no products are enabled', async () => {
    render(
      <ProductUsageContainer
        customer={GITHUB_INC_CUSTOMER}
        enabledProducts={[]}
        filters={DEFAULT_FILTERS}
        isOnlyOrgAdmin={false}
      />,
    )

    await waitFor(() => expect(screen.queryAllByText('Products selector navigation')).toEqual([]))
  })
})
