import toUpper from 'lodash-es/toUpper'
import toLower from 'lodash-es/toLower'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box, Heading, Text} from '@primer/react'

import {ErrorComponent} from '..'

import {RequestState} from '../../enums'
import {formatMoneyDisplay} from '../../utils/money'
import {boxStyle, cardHeadingStyle} from '../../utils/style'

export enum UsageInfoTileVariant {
  amountSpent = 'AMOUNT_SPENT',
  quantityUsed = 'QUANTITY_USED',
}

interface UsageInfoTileProps {
  productName: string
  requestState: RequestState
  totalSpendOrSeats: number
  variant: UsageInfoTileVariant
}

export default function UsageInfoTile({productName, requestState, totalSpendOrSeats, variant}: UsageInfoTileProps) {
  function toTitleCase(str: string): string {
    return str
      .split(' ')
      .map(word => toUpper(word.charAt(0)) + toLower(word.slice(1)))
      .join(' ')
  }

  const capitalizedProductName = toTitleCase(productName)
  function defaultTitle(): string {
    if (variant === UsageInfoTileVariant.amountSpent) {
      return `Spend on ${capitalizedProductName}`
    } else {
      return `Seats used`
    }
  }

  function defaultSubtitle() {
    if (variant === UsageInfoTileVariant.amountSpent) {
      return `Showing total spend on ${capitalizedProductName} for your enterprise for the current billing cycle minus discounts.`
    } else {
      return 'Showing total unique seats billed for your enterprise. Actual billed amount for each seat is prorated based on when it is added during the billing cycle.'
    }
  }

  function spotlightedValue() {
    if (variant === UsageInfoTileVariant.amountSpent) {
      return formatMoneyDisplay(totalSpendOrSeats)
    } else {
      return totalSpendOrSeats.toFixed(2)
    }
  }

  return (
    <Box sx={boxStyle}>
      <Heading as="h3" sx={cardHeadingStyle}>
        {defaultTitle()}
      </Heading>
      {[RequestState.INIT, RequestState.LOADING].includes(requestState) && (
        <>
          <LoadingSkeleton variant="rounded" height="36px" />
          <LoadingSkeleton variant="rounded" height="xl" />
        </>
      )}
      {requestState === RequestState.ERROR && (
        <ErrorComponent sx={{border: 0}} testid={`${productName}-usage-loading-error`} text="Something went wrong" />
      )}
      {requestState === RequestState.IDLE && (
        <Text sx={{display: 'block', fontSize: 4, lineHeight: '36px'}} data-testid="number-display">
          {spotlightedValue()}
        </Text>
      )}
      <Text as="p" sx={{mb: 0, color: 'fg.muted'}}>
        {defaultSubtitle()}
      </Text>
    </Box>
  )
}
