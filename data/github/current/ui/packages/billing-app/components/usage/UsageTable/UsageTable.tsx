import {useMemo} from 'react'
import {Box} from '@primer/react'

import {UsageTableRow, UsageTableRowSkeleton} from '.'
import {ErrorComponent} from '../..'

import {containerStyle, fixedWidthCell, identifierCell, tableStyle, theadStyle, trStyle} from './style'
import {DEFAULT_GROUP_TYPE} from '../../../constants'
import {RequestState, UsageGrouping, UsagePeriod} from '../../../enums'
import {groupLineItems, sortByUsageAtDesc} from '../../../utils/group'
import {isProductUsageLineItem, isRepoUsageLineItem} from '../../../utils/types'
import {useUsageTableData} from '../../../hooks/usage'

import type {Filters, ProductUsageLineItem, UsageLineItem} from '../../../types/usage'

const aspectRatio = '3 / 1'

const getRowKey = (lineItem: UsageLineItem, groupType: UsageGrouping): string => {
  if (groupType === UsageGrouping.NONE) return lineItem.usageAt
  if (isRepoUsageLineItem(lineItem)) return `${lineItem.org.name}-${lineItem.repo.name}`
  else if (isProductUsageLineItem(lineItem)) return lineItem.sku
  else return ''
}

interface Props {
  filters: Filters
  requestState: RequestState
  usage: UsageLineItem[]
  useUsageTableDataEndpoint?: boolean
}

export default function UsageTable({filters, requestState, usage, useUsageTableDataEndpoint}: Props) {
  // TODO: Make filters required
  const groupType = filters.group?.type ?? DEFAULT_GROUP_TYPE
  const periodType = filters.period?.type ?? UsagePeriod.DEFAULT

  const {usageTableData, requestState: tableUsageRequestState} = useUsageTableData({filters, useUsageTableDataEndpoint})

  const usageData = useUsageTableDataEndpoint ? usageTableData : usage
  const usageRequestState = useUsageTableDataEndpoint ? tableUsageRequestState : requestState

  const groupedUsage = useMemo(() => {
    return groupType === UsageGrouping.NONE
      ? groupLineItems(usageData, groupType, periodType).sort(sortByUsageAtDesc)
      : // SKU grouping does not use sub table data since there are no rows to expand. With this, we just need to sort the rows by SKU
        groupType === UsageGrouping.SKU
        ? (groupLineItems(usageData, groupType) as ProductUsageLineItem[]).sort((a, b) => {
            return a?.friendlySkuName.localeCompare(b?.friendlySkuName)
          })
        : groupLineItems(usageData, groupType)
  }, [usageData, groupType, periodType])

  const getFirstColumnHeader = (): string => {
    switch (groupType) {
      case UsageGrouping.NONE:
        return 'Date'
      case UsageGrouping.ORG:
        return 'Organizations'
      case UsageGrouping.PRODUCT:
        return 'Products'
      case UsageGrouping.REPO:
        return 'Repositories'
      case UsageGrouping.SKU:
        return 'SKUs'
      default:
        return ''
    }
  }

  const showQuantity = groupType === UsageGrouping.SKU
  const showPricePerUnit = groupType === UsageGrouping.SKU
  const expandable = groupType !== UsageGrouping.SKU

  if (usageRequestState === RequestState.ERROR) {
    return <ErrorComponent sx={{aspectRatio}} testid="usage-loading-error" text="Something went wrong" />
  }

  // don't return anything if we made a request and there is no data
  if (usageRequestState === RequestState.IDLE && groupedUsage.length === 0) {
    return null
  }

  return (
    <Box sx={containerStyle}>
      <Box sx={tableStyle} data-testid="usage-table">
        <Box sx={theadStyle}>
          <Box sx={trStyle}>
            <Box sx={identifierCell}>{getFirstColumnHeader()}</Box>
            {showQuantity && <Box sx={fixedWidthCell}>Units</Box>}
            {showPricePerUnit && <Box sx={fixedWidthCell}>Price/unit</Box>}
            <Box sx={fixedWidthCell}>Gross amount</Box>
            <Box sx={fixedWidthCell}>Billed amount</Box>
          </Box>
        </Box>
        <div>
          {[RequestState.INIT, RequestState.LOADING].includes(usageRequestState) && (
            <span data-testid="usage-table-row-skeletons">
              <UsageTableRowSkeleton showQuantity={showQuantity} showPricePerUnit={showPricePerUnit} />
              <UsageTableRowSkeleton showQuantity={showQuantity} showPricePerUnit={showPricePerUnit} />
              <UsageTableRowSkeleton showQuantity={showQuantity} showPricePerUnit={showPricePerUnit} />
            </span>
          )}
          {usageRequestState === RequestState.IDLE &&
            groupedUsage.map(row => (
              <UsageTableRow
                expandable={expandable}
                key={getRowKey(row, groupType)}
                rawUsage={usage}
                row={row}
                showPricePerUnit={showPricePerUnit}
                showQuantity={showQuantity}
                filters={filters}
              />
            ))}
        </div>
      </Box>
    </Box>
  )
}
