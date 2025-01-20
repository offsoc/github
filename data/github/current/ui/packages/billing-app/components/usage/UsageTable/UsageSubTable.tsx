import {borderTop, fixedWidthCell, identifierCell, tableStyle, trStyle} from './style'
import {formatQuantityDisplay, getBilledAmount} from '../../../utils/usage'

import {Box} from '@primer/react'
import type {ProductUsageLineItem} from '../../../types/usage'
import type {UsageGrouping} from '../../../enums'
import {formatMoneyDisplay} from '../../../utils/money'

interface Props {
  groupType: UsageGrouping
  data: ProductUsageLineItem[]
}

export default function UsageSubTable({groupType, data}: Props) {
  // sort by SKU name to preserve order of row entries between sub table rows
  const sortedData = data.sort((a, b) => {
    return a.friendlySkuName.localeCompare(b.friendlySkuName)
  })

  return (
    <Box sx={tableStyle} data-testid="usage-sub-table">
      <Box sx={{display: 'flex'}}>
        <Box sx={{width: 56}} />
        <Box sx={{...identifierCell, color: 'fg.subtle', pl: 0}}>SKU</Box>
        <Box sx={{...fixedWidthCell, color: 'fg.subtle'}}>Units</Box>
        <Box sx={{...fixedWidthCell, color: 'fg.subtle'}}>Price/unit</Box>
        <Box sx={{...fixedWidthCell, color: 'fg.subtle'}}>Gross amount</Box>
        <Box sx={{...fixedWidthCell, color: 'fg.subtle'}}>Billed amount</Box>
      </Box>
      <div>
        {sortedData.map(row => {
          return (
            <Box sx={{...trStyle}} key={`sub-table-${row.product}-${row.sku}-${row.usageAt}`}>
              <Box sx={{width: 56}} />
              <Box sx={{...borderTop, ...identifierCell, pl: 0}} data-testid="sub-sku-td">
                {row.friendlySkuName ?? row.sku}
              </Box>
              <Box sx={{...fixedWidthCell, ...borderTop}} data-testid="sub-quantity-td">
                {formatQuantityDisplay(row)}
              </Box>
              <Box sx={{...fixedWidthCell, ...borderTop}} data-testid="sub-applied-cost-per-quantity-td">
                {formatMoneyDisplay(row.appliedCostPerQuantity, 6)}
              </Box>
              <Box sx={{...fixedWidthCell, ...borderTop}} data-testid="sub-gross-amount-td">
                {formatMoneyDisplay(row.billedAmount)}
              </Box>
              <Box sx={{...fixedWidthCell, ...borderTop}} data-testid="sub-billed-amount-td">
                {getBilledAmount(row.totalAmount, groupType)}
              </Box>
            </Box>
          )
        })}
      </div>
    </Box>
  )
}
