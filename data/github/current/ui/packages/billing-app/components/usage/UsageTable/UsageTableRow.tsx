import {Box, Details, Link, Octicon, Spinner, useDetails} from '@primer/react'
import {ChevronDownIcon, ChevronRightIcon} from '@primer/octicons-react'
import type {Filters, RepoUsageLineItem, UsageLineItem} from '../../../types/usage'
import {RequestState, UsageGrouping, UsagePeriod} from '../../../enums'
import {borderTop, cellStyle, fixedWidthCell, identifierCell, trStyle} from './style'
import {formatQuantityDisplay, getBilledAmount} from '../../../utils/usage'
import {isProductUsageLineItem, isRepoUsageLineItem} from '../../../utils/types'

import {DEFAULT_GROUP_TYPE} from '../../../constants'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {UsageSubTable} from '.'
import {formatMoneyDisplay} from '../../../utils/money'
import {formatUsageDateForPeriod} from '../../../utils/date'
import {useMemo} from 'react'
import useUsageSubTableData from '../../../hooks/usage/use-usage-sub-table-data'

const avatarStyle = {mr: 2}
const spinnerStyle = {
  mt: 3,
  mb: 3,
  mr: 'auto',
  ml: 'auto',
}

interface UsageTableRowProps {
  expandable: boolean
  rawUsage: UsageLineItem[]
  row: UsageLineItem | RepoUsageLineItem
  showPricePerUnit: boolean
  showQuantity: boolean
  filters: Filters
}

export default function UsageTableRow({
  expandable,
  rawUsage,
  row,
  showPricePerUnit,
  showQuantity,
  filters,
}: UsageTableRowProps) {
  const {getDetailsProps, open} = useDetails({closeOnOutsideClick: false})
  const {usage, requestState} = useUsageSubTableData({
    lineItem: row,
    open,
    rawUsage,
    filters,
  })

  // TODO: Make filters required
  const groupType = filters?.group?.type ?? DEFAULT_GROUP_TYPE
  const periodType = filters?.period?.type ?? UsagePeriod.DEFAULT

  // when grouping by product we can avoid an extra request to billing platform to get usage data by
  // filtering sub table usage for the current row's product (we don't need to do this for SKU since
  // there are no sub tables for SKU)
  let usageSubTableData = usage
  if (groupType === UsageGrouping.PRODUCT && isProductUsageLineItem(row)) {
    usageSubTableData = usage.filter(usageItem => {
      return usageItem.product === row.product
    })
  }

  const getFirstColumnContent = (): JSX.Element | null => {
    if (isProductUsageLineItem(row)) {
      let text
      if (groupType === UsageGrouping.NONE) text = formatUsageDateForPeriod(row.usageAt, periodType)
      if (groupType === UsageGrouping.PRODUCT) text = row.product
      if (groupType === UsageGrouping.SKU) text = row.friendlySkuName
      return <span>{text}</span>
    } else if (isRepoUsageLineItem(row)) {
      return (
        <Link
          href={groupType === UsageGrouping.REPO ? `/${row.org.name}/${row.repo.name}` : `/${row.org.name}`}
          target="_blank"
        >
          {row.org.avatarSrc && <GitHubAvatar square src={row.org.avatarSrc} size={16} sx={avatarStyle} />}
          <span>{groupType === UsageGrouping.ORG ? row.org.name : `${row.org.name}/${row.repo.name}`}</span>
        </Link>
      )
    } else return null
  }

  const getRowContent = (): JSX.Element => {
    return (
      <Box sx={{...trStyle}}>
        {expandable && (
          // Make the clickable area a bit larger
          <Details {...getDetailsProps()} sx={{...cellStyle, p: 2, pr: 0}}>
            <Box
              as={'summary'}
              sx={{p: 2}}
              title={open ? 'Hide Usage Breakdown' : 'Show Usage Breakdown'}
              data-testid={'usage-details'}
            >
              <Octicon icon={open ? ChevronDownIcon : ChevronRightIcon} />
            </Box>
          </Details>
        )}
        <Box sx={{...identifierCell}} data-testid="identifier-td">
          {getFirstColumnContent()}
        </Box>
        {showQuantity && (
          <Box sx={{...fixedWidthCell, color: 'fg.muted'}} data-testid="quantity-td">
            {formatQuantityDisplay(row)}
          </Box>
        )}
        {showPricePerUnit && (
          <Box sx={{...fixedWidthCell, color: 'fg.muted'}} data-testid="applied-cost-per-quantity-td">
            {formatMoneyDisplay(row.appliedCostPerQuantity, 6)}
          </Box>
        )}
        <Box sx={{...fixedWidthCell, color: 'fg.muted'}} data-testid="gross-amount-td">
          {formatMoneyDisplay(row.billedAmount)}
        </Box>
        <Box sx={{...fixedWidthCell, fontWeight: 'bold'}} data-testid="billed-amount-td">
          {getBilledAmount(row.totalAmount, groupType)}
        </Box>
      </Box>
    )
  }

  const testId = useMemo(() => {
    if (isProductUsageLineItem(row)) {
      if (groupType === UsageGrouping.NONE) return `usage-date-${formatUsageDateForPeriod(row.usageAt, periodType)}`
      if (groupType === UsageGrouping.PRODUCT) return `usage-${row.product}`
      if (groupType === UsageGrouping.SKU) return `usage-${row.sku}`
    } else if (isRepoUsageLineItem(row)) {
      if (groupType === UsageGrouping.ORG) return `usage-${row.org.name}`
      if (groupType === UsageGrouping.REPO) return `usage-${row.org.name}-${row.repo.name}`
    }
  }, [row, groupType, periodType])

  return (
    <Box sx={borderTop} data-testid={testId}>
      {getRowContent()}
      <Box sx={trStyle}>
        {requestState === RequestState.LOADING && <Spinner sx={spinnerStyle} />}
        {open && requestState === RequestState.IDLE && <UsageSubTable data={usageSubTableData} groupType={groupType} />}
      </Box>
    </Box>
  )
}
