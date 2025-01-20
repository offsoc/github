import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'

import {CurrentDiscountsListDialog} from '../../../components/usage'
import {getUpdatedDiscountAmounts, filterbyEnabledProducts} from '../../../utils'
import type {DiscountDataArray} from '../../../types/discounts'

import {MOCK_PRODUCT_ACTIONS, MOCK_PRODUCT_LFS} from '../../../test-utils/mock-data'
import {MOCK_DISCOUNTS, MOCK_DISCOUNTS_WITH_FREE_PUBLIC_REPO} from '../../../test-utils/mock-discount-data'

function getTotalDiscount(data: DiscountDataArray): number {
  return data.reduce((acc, discount) => acc + discount.currentAmount, 0)
}

describe('CurrentDiscountsListDialog', () => {
  test('Opens dialog when more details button is clicked', async () => {
    const totalDiscount = getTotalDiscount(MOCK_DISCOUNTS)
    const discountTargetAmounts = getUpdatedDiscountAmounts(MOCK_DISCOUNTS)
    render(
      <CurrentDiscountsListDialog
        discountTargetAmounts={discountTargetAmounts}
        totalDiscount={totalDiscount}
        isOrganization={false}
      />,
    )

    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    act(() => {
      screen.getByText('More details').click()
    })
    await expect(screen.getByRole('dialog')).toBeVisible()
  })

  test('Renders the discount usage card for one product', async () => {
    const enabledProducts = [MOCK_PRODUCT_ACTIONS]
    const enabledDiscounts = MOCK_DISCOUNTS.filter(filterbyEnabledProducts(enabledProducts))
    const totalDiscount = getTotalDiscount(enabledDiscounts)
    const discountTargetAmounts = getUpdatedDiscountAmounts(enabledDiscounts)

    render(
      <CurrentDiscountsListDialog
        discountTargetAmounts={discountTargetAmounts}
        totalDiscount={totalDiscount}
        isOrganization={false}
      />,
    )
    act(() => {
      screen.getByText('More details').click()
    })
    expect(screen.getByTestId('total-discount')).toHaveTextContent('$396.00')
    expect(screen.getByTestId('actions_minutes-fixed-discount')).toHaveTextContent(
      '50,000 included Actions minutes(~$400.00 off*)$200.00',
    )
    expect(screen.getByTestId('actions_storage-fixed-discount')).toHaveTextContent(
      '50 GB included Actions storage(~$12.50 off*)$10.00',
    )
    expect(screen.getByTestId('enterprise-fixed-discount')).toHaveTextContent(
      'Enterprise discount coupon ($90.00 off)$80.00',
    )
    expect(screen.getByTestId('repo-fixed-discount')).toHaveTextContent('Discount for repositories ($100.50 off)$5.00')
    expect(screen.getByTestId('org-fixed-discount')).toHaveTextContent('Discount for organizations ($50.00 off)$15.00')
    expect(screen.getByTestId('enterprise-percentage-discount-0')).toHaveTextContent(
      'Enterprise discount coupon (10% off)$50.00',
    )
    expect(screen.getByTestId('enterprise-percentage-discount-1')).toHaveTextContent(
      'Enterprise discount coupon (5% off)$25.00',
    )
    expect(screen.getByTestId('repo-percentage-discount-0')).toHaveTextContent(
      'Discount for repositories (15% off)$1.00',
    )
    expect(screen.getByTestId('org-percentage-discount-0')).toHaveTextContent(
      'Discount for organizations (20% off)$10.00',
    )
  })

  test('Renders the discount usage card for two products', async () => {
    const enabledProducts = [MOCK_PRODUCT_ACTIONS, MOCK_PRODUCT_LFS]
    const enabledDiscounts = MOCK_DISCOUNTS.filter(filterbyEnabledProducts(enabledProducts))
    const totalDiscount = getTotalDiscount(enabledDiscounts)
    const discountTargetAmounts = getUpdatedDiscountAmounts(enabledDiscounts)

    render(
      <CurrentDiscountsListDialog
        discountTargetAmounts={discountTargetAmounts}
        totalDiscount={totalDiscount}
        isOrganization={false}
      />,
    )
    act(() => {
      screen.getByText('More details').click()
    })
    expect(screen.getByTestId('total-discount')).toHaveTextContent('$426.00')
    expect(screen.getByTestId('actions_minutes-fixed-discount')).toHaveTextContent(
      '50,000 included Actions minutes(~$400.00 off*)$200.00',
    )
    expect(screen.getByTestId('actions_storage-fixed-discount')).toHaveTextContent(
      '50 GB included Actions storage(~$12.50 off*)$10.00',
    )
    expect(screen.getByTestId('lfs_storage-fixed-discount')).toHaveTextContent(
      'Included LFS storage GiBs ($542.50 off)$20.00',
    )
    expect(screen.getByTestId('lfs_bandwidth-fixed-discount')).toHaveTextContent(
      'Included LFS bandwidth GiBs ($678.13 off)$10.00',
    )
    expect(screen.getByTestId('enterprise-fixed-discount')).toHaveTextContent(
      'Enterprise discount coupon ($90.00 off)$80.00',
    )
    expect(screen.getByTestId('repo-fixed-discount')).toHaveTextContent('Discount for repositories ($100.50 off)$5.00')
    expect(screen.getByTestId('org-fixed-discount')).toHaveTextContent('Discount for organizations ($50.00 off)$15.00')
    expect(screen.getByTestId('enterprise-percentage-discount-0')).toHaveTextContent(
      'Enterprise discount coupon (10% off)$50.00',
    )
    expect(screen.getByTestId('enterprise-percentage-discount-1')).toHaveTextContent(
      'Enterprise discount coupon (5% off)$25.00',
    )
    expect(screen.getByTestId('repo-percentage-discount-0')).toHaveTextContent(
      'Discount for repositories (15% off)$1.00',
    )
    expect(screen.getByTestId('org-percentage-discount-0')).toHaveTextContent(
      'Discount for organizations (20% off)$10.00',
    )
  })

  test('Renders the free for public repo discount when there is one', async () => {
    const enabledProducts = [MOCK_PRODUCT_ACTIONS]
    const enabledDiscounts = MOCK_DISCOUNTS_WITH_FREE_PUBLIC_REPO.filter(filterbyEnabledProducts(enabledProducts))
    const totalDiscount = getTotalDiscount(enabledDiscounts)
    const discountTargetAmounts = getUpdatedDiscountAmounts(enabledDiscounts)

    render(
      <CurrentDiscountsListDialog
        discountTargetAmounts={discountTargetAmounts}
        totalDiscount={totalDiscount}
        isOrganization={false}
      />,
    )
    act(() => {
      screen.getByText('More details').click()
    })
    expect(screen.getByTestId('total-discount')).toHaveTextContent('$60.00')
    expect(screen.getByTestId('enterprise-fixed-discount')).toHaveTextContent(
      'Enterprise discount coupon ($100.00 off)$50.00',
    )
    expect(screen.getByTestId('public_repo-percentage-discount-0')).toHaveTextContent(
      'Discount for usage in public repositories (100% off)$10.00',
    )
  })
})
