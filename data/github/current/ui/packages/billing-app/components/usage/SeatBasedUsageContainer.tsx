import {Box} from '@primer/react'

import {useNetUsageData} from '../../hooks/usage'

import UsageInfoTile, {UsageInfoTileVariant} from './UsageInfoTile'

import type {Filters} from '../../types/usage'

interface Props {
  filters: Filters
  productName: string
}

export function SeatBasedUsageContainer({filters, productName}: Props) {
  const {netUsage, requestState: netUsageRequestState} = useNetUsageData({filters})
  const totalSpend = netUsage.reduce((acc, lineItem) => acc + (lineItem.totalAmount ?? 0), 0)
  const seats = netUsage.reduce((acc, lineItem) => acc + (lineItem.quantity ?? 0), 0)

  return (
    <Box sx={{display: 'grid', gap: 3, gridTemplateColumns: ['1', '1', '1', '1', 'repeat(2, 1fr)']}}>
      <UsageInfoTile
        productName={productName}
        requestState={netUsageRequestState}
        totalSpendOrSeats={totalSpend}
        variant={UsageInfoTileVariant.amountSpent}
      />
      <UsageInfoTile
        productName={productName}
        requestState={netUsageRequestState}
        totalSpendOrSeats={seats}
        variant={UsageInfoTileVariant.quantityUsed}
      />
    </Box>
  )
}
