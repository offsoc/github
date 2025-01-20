import {Box, Heading, Text} from '@primer/react'

import {useDiscounts} from '../../hooks/discount'

import {formatMoneyDisplay} from '../../utils/money'
import {boxStyle, cardHeadingStyle, Fonts} from '../../utils/style'
import {CurrentDiscountsListDialog} from '.'

import type {EnabledProduct} from '../../types/products'

const spendingContainerStyle = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  mb: 2,
}

interface DiscountUsageCardProps {
  enabledProducts: EnabledProduct[]
  isOrganization: boolean
}

export default function DiscountUsageCard({enabledProducts, isOrganization}: DiscountUsageCardProps) {
  const {discounts, discountTargetAmounts} = useDiscounts({enabledProducts})

  const totalDiscount = discounts.reduce((acc, discount) => acc + discount.currentAmount, 0)

  return (
    <Box sx={boxStyle}>
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <Heading as="h3" sx={{...cardHeadingStyle, flex: 'auto'}}>
          Current included usage
        </Heading>
        <CurrentDiscountsListDialog
          discountTargetAmounts={discountTargetAmounts}
          totalDiscount={totalDiscount}
          isOrganization={isOrganization}
        />
      </Box>
      <>
        <Box sx={spendingContainerStyle}>
          <div>
            <Text sx={{mr: 2, fontSize: 4}} data-testid="total-discount">
              {formatMoneyDisplay(totalDiscount)}
            </Text>
          </div>
        </Box>
        <Text as="p" sx={{mb: 0, color: 'fg.muted', fontSize: Fonts.FontSizeSmall}}>
          {isOrganization
            ? 'Showing currently applied discounts for your organization.'
            : 'Showing currently applied discounts for your enterprise.'}
        </Text>
      </>
    </Box>
  )
}
