import {useEffect, useState} from 'react'
import {Box, Heading, Text} from '@primer/react'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {formatMoneyDisplay} from '../../utils/money'
import {boxStyle, cardHeadingStyle, Fonts} from '../../utils/style'
import {UsageOverviewListDialog} from '.'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {LoadingComponent} from '..'
import {useParams} from 'react-router-dom'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {TOTAL_USAGE_ROUTE, matchBaseRouteByPath, findRouteBestMatchByPath} from '../../routes'
import type {CustomerSelection} from '../../types/usage'

const cardStyle = {
  ...boxStyle,
  display: 'flex',
  flexDirection: 'column',
}

const moneyContainerStyle = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  mb: 2,
}

interface TotalUsageCardProps {
  customerSelections: CustomerSelection[]
  isOrganization: boolean
}

const getRoute = (customerSelection: CustomerSelection, params: object): string => {
  const pathname = ssrSafeLocation.pathname
  let newPath =
    matchBaseRouteByPath(pathname)
      ?.childRoute(TOTAL_USAGE_ROUTE.fullPath)
      .generateFullPath({...params}) ?? ''

  const matchingRoute = findRouteBestMatchByPath(newPath)
  if (!matchingRoute) newPath = TOTAL_USAGE_ROUTE.fullPath

  const queryParamString = new URLSearchParams({customer_id: customerSelection.id}).toString()
  return `${newPath}?${queryParamString}`
}

export default function TotalUsageCard({customerSelections, isOrganization}: TotalUsageCardProps) {
  const params = useParams()
  const [totalUsage, setTotalUsage] = useState(0)
  const [isLoadingTotalUsage, setLoadingTotalUsage] = useState(true)
  const [usageMap, setUsageMap] = useState<Record<string, number>>({})

  useEffect(() => {
    const loadUsageData = async () => {
      const promises = customerSelections.map(async customerSelection => {
        const route = getRoute(customerSelection, params)
        const res = await verifiedFetchJSON(route, {
          method: 'GET',
        })
        return {res, id: customerSelection.id}
      })
      const results = await Promise.all(promises)
      let totalUsageTemp = 0
      const usageMapTemp: Record<string, number> = {}
      for (const {res, id} of results) {
        if (res.ok) {
          const data = await res.json()
          totalUsageTemp += data.usage.billableAmount
          usageMapTemp[id] = data.usage.billableAmount
        }
      }
      setTotalUsage(totalUsageTemp)
      setUsageMap(usageMapTemp)
      setLoadingTotalUsage(false)
    }
    loadUsageData()
  }, [customerSelections, totalUsage, params])

  return (
    <Box sx={cardStyle}>
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <Heading as="h3" sx={{...cardHeadingStyle, flex: 'auto'}}>
          Current metered usage
        </Heading>
        {!isLoadingTotalUsage && !isOrganization && (
          <UsageOverviewListDialog
            customerSelections={customerSelections}
            totalUsage={totalUsage}
            usageMap={usageMap}
          />
        )}
      </Box>
      <>
        <Box sx={isLoadingTotalUsage ? {display: 'block', width: '50%'} : moneyContainerStyle}>
          <div>
            {isLoadingTotalUsage ? (
              <Box sx={{display: 'flex', justifyContent: 'space-between', py: 2, mr: 3}}>
                <LoadingComponent sx={{p: 0, border: 0}}>
                  <LoadingSkeleton sx={{flex: 1}} variant="rounded" height="md" />
                </LoadingComponent>
              </Box>
            ) : (
              <Text sx={{mr: 2, fontSize: 4}} data-testid="total-discount">
                {formatMoneyDisplay(totalUsage)}
              </Text>
            )}
          </div>
        </Box>
        <Text as="p" sx={{mb: 0, color: 'fg.muted', fontSize: Fonts.FontSizeSmall}}>
          {isOrganization
            ? 'Showing gross metered usage for your organization.'
            : 'Showing gross metered usage for your enterprise including all cost centers.'}
        </Text>
      </>
    </Box>
  )
}
