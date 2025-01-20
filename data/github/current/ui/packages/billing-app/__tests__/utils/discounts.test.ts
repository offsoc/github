import {filterbyEnabledProducts, getTextForDiscount} from '../../utils/discount'

import {MOCK_PRODUCT_ACTIONS, MOCK_PRODUCT_LFS} from '../../test-utils/mock-data'
import {MOCK_DISCOUNTS} from '../../test-utils/mock-discount-data'
import {DiscountTargetType, DiscountType} from '../../enums'
import type {DiscountAmount} from '../../types/discounts'

describe('filterByEnabledProducts', () => {
  it('filters out products that are not enabled', () => {
    expect(MOCK_DISCOUNTS).toHaveLength(11) // includes lfs
    let filteredDiscounts = MOCK_DISCOUNTS.filter(filterbyEnabledProducts([MOCK_PRODUCT_ACTIONS]))
    expect(filteredDiscounts).toHaveLength(9) // lfs discounts filtered out
    filteredDiscounts = MOCK_DISCOUNTS.filter(filterbyEnabledProducts([MOCK_PRODUCT_ACTIONS, MOCK_PRODUCT_LFS]))
    expect(filteredDiscounts).toHaveLength(11)
  })
})

describe('getTextForDiscount', () => {
  it('returns the correct text for an actions fixed amount discount', () => {
    const discount: DiscountAmount = {
      appliedAmount: 10,
      targetAmount: 400,
    }

    const text = getTextForDiscount(discount, DiscountTargetType.SKU_ACTIONS_MINUTES, DiscountType.FixedAmount)
    expect(text).toStrictEqual(['50,000 included Actions minutes', '(~$400.00 off*)'])
  })

  it('returns the correct text for a non-actions fixed amount discount', () => {
    const discount: DiscountAmount = {
      appliedAmount: 10,
      targetAmount: 400,
    }

    const text = getTextForDiscount(discount, DiscountTargetType.ENTERPRISE, DiscountType.FixedAmount)
    expect(text).toStrictEqual(['Enterprise discount coupon ($400.00 off)'])
  })

  it('returns the correct text for a non-actions percentage discount', () => {
    const discount: DiscountAmount = {
      appliedAmount: 10,
      targetAmount: 40,
    }

    const text = getTextForDiscount(discount, DiscountTargetType.ORGANIZATION, DiscountType.Percentage)
    expect(text).toStrictEqual(['Discount for organizations (40% off)'])
  })
})
