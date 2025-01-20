import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box, Heading, ProgressBar, Text} from '@primer/react'

import {ErrorComponent} from '..'

import {BUDGET_SCOPE_ENTERPRISE, Products} from '../../constants'
import {DiscountTargetType, DiscountType, RequestState} from '../../enums'
import {formatMoneyDisplay} from '../../utils/money'
import {boxStyle, cardHeadingStyle} from '../../utils/style'

import type {Budget} from '../../types/budgets'
import type {EnabledProduct} from '../../types/products'
import type {UsageLineItem} from '../../types/usage'
import {getTextForDiscount} from '../../utils'
import {useDiscounts} from '../../hooks/discount'

const cardStyle = {
  ...boxStyle,
  mb: 3,
}

const spendingContainerStyle = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
}

interface DefaultUsageCardProps {
  budgets: Budget[]
  isOrgAdmin: boolean
  product: EnabledProduct
  requestState: RequestState
  usage: UsageLineItem[]
}

export default function DefaultUsageCard({budgets, isOrgAdmin, product, requestState, usage}: DefaultUsageCardProps) {
  const enterpriseBudget = budgets.find(b => b.targetType === BUDGET_SCOPE_ENTERPRISE)
  const budgetAmount = enterpriseBudget?.targetAmount || 0
  const hasEnterpriseBudget = budgetAmount > 0

  const {discountTargetAmounts} = useDiscounts({enabledProducts: [product]})
  let actionsMinutesDiscountText = ''

  if (product.name === Products.actions) {
    const currentDiscountAmount =
      discountTargetAmounts[DiscountTargetType.SKU_ACTIONS_MINUTES]?.[DiscountType.FixedAmount]
    if (currentDiscountAmount) {
      actionsMinutesDiscountText = getTextForDiscount(
        currentDiscountAmount,
        DiscountTargetType.SKU_ACTIONS_MINUTES,
        DiscountType.FixedAmount,
      ).join(' ')
    }
  }

  const totalActual = usage.reduce((acc, lineItem) => acc + (lineItem.billedAmount ?? 0), 0)
  const totalDiscount = usage.reduce((acc, lineItem) => acc + (lineItem.discountAmount ?? 0), 0)
  const totalBilled = usage.reduce((acc, lineItem) => acc + (lineItem.totalAmount ?? 0), 0)

  const usagePercentage = totalActual && budgetAmount > 0 ? (totalActual / budgetAmount) * 100 : 0

  return (
    <Box sx={cardStyle}>
      <Heading as="h3" sx={cardHeadingStyle}>
        {product.friendlyProductName} usage
      </Heading>
      <>
        <Box sx={spendingContainerStyle}>
          <div>
            {[RequestState.INIT, RequestState.LOADING].includes(requestState) && (
              <LoadingSkeleton variant="rounded" height="36px" />
            )}
            {requestState === RequestState.ERROR && (
              <ErrorComponent
                sx={{border: 0}}
                testid={`${product.name}-usage-loading-error`}
                text="Something went wrong"
              />
            )}
            {requestState === RequestState.IDLE && (
              <TotalTextBox
                isOrgAdmin={isOrgAdmin}
                totalActual={totalActual}
                totalDiscount={totalDiscount}
                totalBilled={totalBilled}
              />
            )}
            {!isOrgAdmin && hasEnterpriseBudget && (
              <ProgressBar
                bg={usagePercentage < 100 ? 'accent.emphasis' : 'danger.emphasis'}
                progress={usagePercentage}
                sx={{mb: 2}}
                data-testid={`${product.name}-usage`}
              />
            )}
            {!isOrgAdmin && product.name === Products.actions && (
              <Text as="p" sx={{mb: 0, color: 'fg.muted'}}>
                Usage for Actions and Actions Runners. {actionsMinutesDiscountText}.
              </Text>
            )}
          </div>
        </Box>
      </>
    </Box>
  )
}

interface TotalTextBoxProps {
  isOrgAdmin: boolean
  totalActual: number
  totalDiscount: number
  totalBilled: number
}

function TotalTextBox({isOrgAdmin, totalActual, totalDiscount, totalBilled}: TotalTextBoxProps): JSX.Element {
  if (isOrgAdmin) {
    return (
      <Box sx={{display: 'flex', alignItems: 'flex-end'}}>
        <Text sx={{display: 'block', fontSize: 4, lineHeight: '36px', mr: 2}}>{formatMoneyDisplay(totalActual)}</Text>
        <Text sx={{color: 'fg.subtle', lineHeight: '28px'}}>spent </Text>
      </Box>
    )
  }

  return (
    <Box sx={{display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap'}} data-testid="actions-totals">
      <Text sx={{display: 'block', fontSize: 4, lineHeight: '36px', mr: 2}}>{formatMoneyDisplay(totalActual)}</Text>
      <Text sx={{color: 'fg.subtle', lineHeight: '28px', mr: 2}}>consumed usage - </Text>
      <Text sx={{display: 'block', fontSize: 4, lineHeight: '36px', mr: 2}}>{formatMoneyDisplay(totalDiscount)}</Text>
      <Text sx={{color: 'fg.subtle', lineHeight: '28px', mr: 2}}>in discounts = </Text>
      <Text sx={{display: 'block', fontSize: 4, lineHeight: '36px', mr: 2}}>{formatMoneyDisplay(totalBilled)}</Text>
      <Text sx={{color: 'fg.subtle', lineHeight: '28px'}}>in billable usage </Text>
    </Box>
  )
}
