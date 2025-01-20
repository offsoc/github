import {
  DEFAULT_FILTERS,
  GROUP_SELECTIONS,
  MOCK_LINE_ITEMS,
  MOCK_ORG_LINE_ITEMS,
  MOCK_REPO_LINE_ITEMS,
  PERIOD_SELECTIONS,
} from '../../../test-utils/mock-data'
import {fireEvent, screen, waitFor, within} from '@testing-library/react'

import {RequestState} from '../../../enums'
import {UsageTable} from '../../../components/usage'
import {render} from '@github-ui/react-core/test-utils'
import {mockFetch} from '@github-ui/mock-fetch'

jest.mock('@github-ui/ssr-utils', () => ({
  get ssrSafeLocation() {
    return jest.fn().mockImplementation(() => {
      return {origin: 'https://github.localhost', pathname: '/enterprises/github-inc/billing'}
    })()
  },
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({business: 'github-inc'}),
}))

describe('UsageTable', () => {
  test('Renders usage by SKU when group by SKU is selected', async () => {
    render(
      <UsageTable
        filters={{...DEFAULT_FILTERS, group: GROUP_SELECTIONS[2]}}
        requestState={RequestState.IDLE}
        usage={MOCK_LINE_ITEMS}
      />,
    )

    const expectedSKUs = MOCK_LINE_ITEMS.sort((a, b) => {
      return a.friendlySkuName.localeCompare(b.friendlySkuName)
    }).map(item => item.friendlySkuName)
    const expectedBilledAmount = ['$10.10', '$2.59', '$3.00']
    const expectedQuantity = ['20 min', '10 GB/h', '15 min']
    const expectedAppliedCostPerQuantity = ['$0.505', '$0.259', '$0.20']

    const foundSkuCells = await screen.findAllByTestId('identifier-td')
    for (const [i, sku] of expectedSKUs.entries()) {
      expect(foundSkuCells[i]).toContainElement(await screen.findByText(sku))
    }

    expect((await screen.findAllByTestId('billed-amount-td')).map(cell => cell.innerHTML)).toEqual(expectedBilledAmount)
    expect((await screen.findAllByTestId('quantity-td')).map(cell => cell.innerHTML)).toEqual(expectedQuantity)
    expect((await screen.findAllByTestId('applied-cost-per-quantity-td')).map(cell => cell.innerHTML)).toEqual(
      expectedAppliedCostPerQuantity,
    )
  })

  test('Renders usage by product when group by product is selected', async () => {
    const {user} = render(
      <UsageTable
        filters={{...DEFAULT_FILTERS, group: GROUP_SELECTIONS[1]}}
        requestState={RequestState.IDLE}
        usage={MOCK_LINE_ITEMS}
      />,
    )

    const expectedProducts = ['actions', 'shared_storage']
    const expectedBilledAmount = ['$13.10', '$2.59']

    const foundProductCells = await screen.findAllByTestId('identifier-td')
    for (const [i, product] of expectedProducts.entries()) {
      expect(foundProductCells[i]).toContainElement(await screen.findByText(product))
    }
    expect((await screen.findAllByTestId('billed-amount-td')).map(cell => cell.innerHTML)).toEqual(expectedBilledAmount)

    // expand sub table
    await user.click(within(screen.getByTestId('usage-actions')).getByTestId('usage-details'))

    await waitFor(() => {
      expect(within(screen.getByTestId('usage-actions')).getByTestId('usage-sub-table')).toBeVisible()
    })

    const expectedSubSKUs = ['Macos 12-core', 'Windows 4-core']
    const expectedSubBilledAmount = ['$10.10', '$3.00']
    const expectedSubQuantity = ['20 min', '15 min']
    const expectedSubAppliedCostPerQuantity = ['$0.505', '$0.20']

    const foundSkuCells = await screen.findAllByTestId('sub-sku-td')
    for (const [i, sku] of expectedSubSKUs.entries()) {
      expect(foundSkuCells[i]).toContainElement(await screen.findByText(sku))
    }

    expect((await screen.findAllByTestId('sub-billed-amount-td')).map(cell => cell.innerHTML)).toEqual(
      expectedSubBilledAmount,
    )
    expect((await screen.findAllByTestId('sub-quantity-td')).map(cell => cell.innerHTML)).toEqual(expectedSubQuantity)
    expect((await screen.findAllByTestId('sub-applied-cost-per-quantity-td')).map(cell => cell.innerHTML)).toEqual(
      expectedSubAppliedCostPerQuantity,
    )

    // close sub table
    await user.click(within(screen.getByTestId('usage-actions')).getByTestId('usage-details'))
    await waitFor(() => {
      expect(screen.queryByTestId('usage-sub-table')).toBeNull()
    })
  })

  describe('when group by none is selected', () => {
    test('Renders usage by month when current year is selected', async () => {
      const {user} = render(
        <UsageTable
          filters={{...DEFAULT_FILTERS, period: PERIOD_SELECTIONS[3]}}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
        />,
      )
      const foundDateCells = await screen.findAllByTestId('identifier-td')
      const expectedDates = ['Mar 2023', 'Apr 2023', 'May 2023']
      const expectedBilledAmount = ['$2.59', '$3.00', '$10.10']

      for (const [i, date] of expectedDates.entries()) {
        expect(foundDateCells[i]).toContainElement(await screen.findByText(date))
      }

      expect((await screen.findAllByTestId('billed-amount-td')).map(cell => cell.innerHTML)).toEqual(
        expectedBilledAmount,
      )
      // expand sub table
      await user.click(within(screen.getByTestId('usage-date-Mar 2023')).getByTestId('usage-details'))
      await waitFor(() => {
        expect(within(screen.getByTestId('usage-date-Mar 2023')).getByTestId('usage-sub-table')).toBeVisible()
      })

      const expectedSubSKUs = ['Shared Storage']
      const expectedSubBilledAmount = ['$2.59']
      const expectedSubQuantity = ['10 GB/h']
      const expectedSubAppliedCostPerQuantity = ['$0.259']
      const subTable = within(screen.getByTestId('usage-date-Mar 2023')).getByTestId('usage-sub-table')
      const foundSkuCells = await within(subTable).findAllByTestId('sub-sku-td')
      for (const [i, sku] of expectedSubSKUs.entries()) {
        expect(foundSkuCells[i]).toContainElement(await screen.findByText(sku))
      }

      expect((await within(subTable).findAllByTestId('sub-billed-amount-td')).map(cell => cell.innerHTML)).toEqual(
        expectedSubBilledAmount,
      )
      expect((await within(subTable).findAllByTestId('sub-quantity-td')).map(cell => cell.innerHTML)).toEqual(
        expectedSubQuantity,
      )
      expect(
        (await within(subTable).findAllByTestId('sub-applied-cost-per-quantity-td')).map(cell => cell.innerHTML),
      ).toEqual(expectedSubAppliedCostPerQuantity)
      await user.click(within(screen.getByTestId('usage-date-Mar 2023')).getByTestId('usage-details'))
      await waitFor(() => {
        expect(screen.queryByTestId('usage-sub-table')).toBeNull()
      })
    })

    test('Renders usage by month when last year is selected', async () => {
      const {user} = render(
        <UsageTable
          filters={{...DEFAULT_FILTERS, period: PERIOD_SELECTIONS[5]}}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
        />,
      )
      const foundDateCells = await screen.findAllByTestId('identifier-td')
      const expectedDates = ['Mar 2023', 'Apr 2023', 'May 2023']
      const expectedBilledAmount = ['$2.59', '$3.00', '$10.10']

      for (const [i, date] of expectedDates.entries()) {
        expect(foundDateCells[i]).toContainElement(await screen.findByText(date))
      }

      expect((await screen.findAllByTestId('billed-amount-td')).map(cell => cell.innerHTML)).toEqual(
        expectedBilledAmount,
      )
      // expand sub table
      await user.click(within(screen.getByTestId('usage-date-Mar 2023')).getByTestId('usage-details'))
      await waitFor(() => {
        expect(within(screen.getByTestId('usage-date-Mar 2023')).getByTestId('usage-sub-table')).toBeVisible()
      })

      const expectedSubSKUs = ['Shared Storage']
      const expectedSubBilledAmount = ['$2.59']
      const expectedSubQuantity = ['10 GB/h']
      const expectedSubAppliedCostPerQuantity = ['$0.259']
      const subTable = within(screen.getByTestId('usage-date-Mar 2023')).getByTestId('usage-sub-table')
      const foundSkuCells = await within(subTable).findAllByTestId('sub-sku-td')
      for (const [i, sku] of expectedSubSKUs.entries()) {
        expect(foundSkuCells[i]).toContainElement(await screen.findByText(sku))
      }

      expect((await within(subTable).findAllByTestId('sub-billed-amount-td')).map(cell => cell.innerHTML)).toEqual(
        expectedSubBilledAmount,
      )
      expect((await within(subTable).findAllByTestId('sub-quantity-td')).map(cell => cell.innerHTML)).toEqual(
        expectedSubQuantity,
      )
      expect(
        (await within(subTable).findAllByTestId('sub-applied-cost-per-quantity-td')).map(cell => cell.innerHTML),
      ).toEqual(expectedSubAppliedCostPerQuantity)
      await user.click(within(screen.getByTestId('usage-date-Mar 2023')).getByTestId('usage-details'))
      await waitFor(() => {
        expect(screen.queryByTestId('usage-sub-table')).toBeNull()
      })
    })
  })

  test('Renders usage with day precision when current month is selected', async () => {
    render(
      <UsageTable
        filters={{...DEFAULT_FILTERS, period: PERIOD_SELECTIONS[2]}}
        requestState={RequestState.IDLE}
        usage={MOCK_LINE_ITEMS}
      />,
    )
    const foundDateCells = await screen.findAllByTestId('identifier-td')
    const expectedDates = ['Mar 1, 2023', 'Apr 2, 2023', 'May 3, 2023']
    const expectedBilledAmount = ['$2.59', '$3.00', '$10.10']

    for (const [i, date] of expectedDates.entries()) {
      expect(foundDateCells[i]).toContainElement(await screen.findByText(date))
    }

    expect((await screen.findAllByTestId('billed-amount-td')).map(cell => cell.innerHTML)).toEqual(expectedBilledAmount)
  })

  test('Renders usage with day precision when last month is selected', async () => {
    render(
      <UsageTable
        filters={{...DEFAULT_FILTERS, period: PERIOD_SELECTIONS[4]}}
        requestState={RequestState.IDLE}
        usage={MOCK_LINE_ITEMS}
      />,
    )
    const foundDateCells = await screen.findAllByTestId('identifier-td')
    const expectedDates = ['Mar 1, 2023', 'Apr 2, 2023', 'May 3, 2023']
    const expectedBilledAmount = ['$2.59', '$3.00', '$10.10']

    for (const [i, date] of expectedDates.entries()) {
      expect(foundDateCells[i]).toContainElement(await screen.findByText(date))
    }

    expect((await screen.findAllByTestId('billed-amount-td')).map(cell => cell.innerHTML)).toEqual(expectedBilledAmount)
  })

  test('Renders usage with hour precision when current day is selected', async () => {
    render(
      <UsageTable
        filters={{...DEFAULT_FILTERS, period: PERIOD_SELECTIONS[1]}}
        requestState={RequestState.IDLE}
        usage={MOCK_LINE_ITEMS}
      />,
    )
    const foundDateCells = await screen.findAllByTestId('identifier-td')
    const expectedDates = ['8 AM', '9 AM', '10 AM']
    const expectedBilledAmount = ['$2.59', '$3.00', '$10.10']

    for (const [i, date] of expectedDates.entries()) {
      expect(foundDateCells[i]).toContainElement(await screen.findByText(date))
    }

    expect((await screen.findAllByTestId('billed-amount-td')).map(cell => cell.innerHTML)).toEqual(expectedBilledAmount)
  })

  test('Renders usage with minute precision when current hour is selected', async () => {
    render(
      <UsageTable
        filters={{...DEFAULT_FILTERS, period: PERIOD_SELECTIONS[0]}}
        requestState={RequestState.IDLE}
        usage={MOCK_LINE_ITEMS}
      />,
    )
    const foundDateCells = await screen.findAllByTestId('identifier-td')
    const expectedDates = ['8:00 AM', '9:00 AM', '10:00 AM']
    const expectedBilledAmount = ['$2.59', '$3.00', '$10.10']

    for (const [i, date] of expectedDates.entries()) {
      expect(foundDateCells[i]).toContainElement(await screen.findByText(date))
    }

    expect((await screen.findAllByTestId('billed-amount-td')).map(cell => cell.innerHTML)).toEqual(expectedBilledAmount)
  })
})

describe('UsageTable when grouping by org or repo', () => {
  test('Renders usage by organization when group by organization is selected', async () => {
    const {user} = render(
      <UsageTable
        filters={{...DEFAULT_FILTERS, group: GROUP_SELECTIONS[3]}}
        requestState={RequestState.IDLE}
        usage={MOCK_REPO_LINE_ITEMS}
      />,
    )
    const expectedOrgs = ['test-org-a', 'test-org-b', 'test-org-c', 'test-org-d', 'test-org-e', 'test-org-f']
    const expectedBilledAmount = ['$3.60', '$6.00', '$4.00', '$2.00', '$2.00', '$2.00']

    const foundOrgCells = await screen.findAllByTestId('identifier-td')
    for (const [i, org] of expectedOrgs.entries()) {
      expect(foundOrgCells[i]).toContainElement(await screen.findByText(org))
    }
    expect((await screen.findAllByTestId('gross-amount-td')).map(cell => cell.innerHTML)).toEqual(expectedBilledAmount)

    // We do not show billed amount (net) for org/repo groupings
    expect((await screen.findAllByTestId('billed-amount-td')).map(cell => cell.innerHTML)).toEqual([
      'N/A',
      'N/A',
      'N/A',
      'N/A',
      'N/A',
      'N/A',
    ])

    // mock the request we make when the sub table row is expanded for an org
    mockFetch.mockRouteOnce(
      `/enterprises/github-inc/billing/usage?customer_id=${DEFAULT_FILTERS.customer.id}&group=${GROUP_SELECTIONS[2]?.type}&period=${DEFAULT_FILTERS.period?.type}&query=org%3Atest-org-a`,
      {usage: MOCK_ORG_LINE_ITEMS},
    )

    // expand sub table row for org a's usage
    await user.click(within(screen.getByTestId('usage-test-org-a')).getByTestId('usage-details'))

    await waitFor(() => {
      expect(within(screen.getByTestId('usage-test-org-a')).getByTestId('usage-sub-table')).toBeVisible()
    })
    const expectedSubSKU = 'Actions Linux'
    const expectedSubGrossAmount = '$2.00'
    const expectedSubQuantity = '10 min'
    const expectedSubAppliedCostPerQuantity = '$0.20'

    const skuCell = await screen.findByTestId('sub-sku-td')
    expect(skuCell).toContainElement(await screen.findByText(expectedSubSKU))

    const grossAmount = await screen.findByTestId('sub-gross-amount-td')
    expect(grossAmount.innerHTML).toEqual(expectedSubGrossAmount)

    // We do not show billed amount (net) for org/repo groupings
    const billedAmount = await screen.findByTestId('sub-billed-amount-td')
    expect(billedAmount.innerHTML).toEqual('N/A')

    const quantity = await screen.findByTestId('sub-quantity-td')
    expect(quantity.innerHTML).toEqual(expectedSubQuantity)

    const unitPrice = await screen.findByTestId('sub-applied-cost-per-quantity-td')
    expect(unitPrice.innerHTML).toEqual(expectedSubAppliedCostPerQuantity)

    // close sub table
    await user.click(within(screen.getByTestId('usage-test-org-a')).getByTestId('usage-details'))
    await waitFor(() => {
      expect(screen.queryByTestId('usage-sub-table')).toBeNull()
    })
  })

  test('Renders usage by repo when group by repo is selected', async () => {
    const {user} = render(
      <UsageTable
        filters={{...DEFAULT_FILTERS, group: GROUP_SELECTIONS[4]}}
        requestState={RequestState.IDLE}
        usage={MOCK_REPO_LINE_ITEMS}
      />,
    )
    const expectedRepos = [
      'test-org-a/test-repo-a',
      'test-org-b/test-repo-b',
      'test-org-b/test-repo-a',
      'test-org-c/test-repo-c',
      'test-org-d/test-repo-d',
      'test-org-e/test-repo-e',
      'test-org-f/test-repo-f',
    ]
    const expectedBilledAmount = ['$3.60', '$3.00', '$3.00', '$4.00', '$2.00', '$2.00', '$2.00']

    const foundRepoCells = await screen.findAllByTestId('identifier-td')
    for (const [i, repo] of expectedRepos.entries()) {
      expect(foundRepoCells[i]).toContainElement(await screen.findByText(repo))
    }
    expect((await screen.findAllByTestId('gross-amount-td')).map(cell => cell.innerHTML)).toEqual(expectedBilledAmount)

    // We do not show billed amount (net) for org/repo groupings
    expect((await screen.findAllByTestId('billed-amount-td')).map(cell => cell.innerHTML)).toEqual([
      'N/A',
      'N/A',
      'N/A',
      'N/A',
      'N/A',
      'N/A',
      'N/A',
    ])

    // expand sub table for repo a's usage
    fireEvent.click(within(screen.getByTestId('usage-test-org-a-test-repo-a')).getByTestId('usage-details'))
    // await user.click(within(screen.getByTestId('usage-test-org-a-test-repo-a')).getByTestId('usage-details'))

    // mock the request we make when the sub table row is expanded for an repo
    mockFetch.mockRouteOnce(
      `/enterprises/github-inc/billing/usage?customer_id=${DEFAULT_FILTERS.customer.id}&group=${GROUP_SELECTIONS[2]?.type}&period=${DEFAULT_FILTERS.period?.type}&query=repo%3Atest-org-a%2Ftest-repo-a`,
      {usage: MOCK_ORG_LINE_ITEMS},
    )

    await waitFor(() => {
      expect(within(screen.getByTestId('usage-test-org-a-test-repo-a')).getByTestId('usage-sub-table')).toBeVisible()
    })

    const expectedSubSKU = 'Actions Linux'
    const expectedSubBilledAmount = '$2.00'
    const expectedSubQuantity = '10 min'
    const expectedSubAppliedCostPerQuantity = '$0.20'

    const skuCell = await screen.findByTestId('sub-sku-td')
    expect(skuCell.innerHTML).toEqual(expectedSubSKU)

    const grossAmount = await screen.findByTestId('sub-gross-amount-td')
    expect(grossAmount.innerHTML).toEqual(expectedSubBilledAmount)

    const netAmount = await screen.findByTestId('sub-billed-amount-td')
    expect(netAmount.innerHTML).toEqual('N/A')

    const quantity = await screen.findByTestId('sub-quantity-td')
    expect(quantity.innerHTML).toEqual(expectedSubQuantity)

    const unitPrice = await screen.findByTestId('sub-applied-cost-per-quantity-td')
    expect(unitPrice.innerHTML).toEqual(expectedSubAppliedCostPerQuantity)

    // close sub table
    await user.click(within(screen.getByTestId('usage-test-org-a-test-repo-a')).getByTestId('usage-details'))
    await waitFor(() => {
      expect(screen.queryByTestId('usage-sub-table')).toBeNull()
    })
  })

  describe('loading states', () => {
    it('Renders a loading component in init state', async () => {
      render(<UsageTable filters={DEFAULT_FILTERS} requestState={RequestState.INIT} usage={[]} />)

      expect(await screen.findByTestId('usage-table-row-skeletons')).toBeVisible()
    })

    it('Renders a loading component while usage is being requested', async () => {
      render(<UsageTable filters={DEFAULT_FILTERS} requestState={RequestState.LOADING} usage={[]} />)

      expect(await screen.findByTestId('usage-table-row-skeletons')).toBeVisible()
    })

    it('Renders an error component when the usage request fails', async () => {
      render(<UsageTable filters={DEFAULT_FILTERS} requestState={RequestState.ERROR} usage={[]} />)

      expect(await screen.findByTestId('usage-loading-error')).toBeVisible()
    })
  })
})
