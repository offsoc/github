import {ActionList, ActionMenu, Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import {UsageSearchBar} from '.'

import {
  GROUP_BY_SKU_TYPE,
  GROUP_BY_ORG_TYPE,
  GROUP_BY_REPO_TYPE,
  DEFAULT_GROUP_TYPE,
  GROUP_BY_NONE_TYPE,
} from '../../constants'

import type {Customer} from '../../types/common'
import type {GroupSelection, PeriodSelection, Filters} from '../../types/usage'

const containerStyle = {
  display: 'flex',
  flexWrap: ['nowrap', 'nowrap', 'wrap'],
  flexDirection: ['column', 'column', 'row'],
  alignItems: 'stretch',
  mb: 3,
}

interface Props {
  customer: Customer
  filters: Filters
  setFilters: (filters: Filters) => void
  groupSelections?: GroupSelection[]
  periodSelections?: PeriodSelection[]
  showSearch?: boolean
  useUsageChartDataEndpoint: boolean
  sx?: BetterSystemStyleObject
}

export default function UsageFilters({
  customer,
  filters,
  setFilters,
  groupSelections = [],
  periodSelections = [],
  showSearch = false,
  useUsageChartDataEndpoint = false,
  sx,
}: Props) {
  const setSearchQuery = (query: string) => {
    setFilters({
      ...filters,
      searchQuery: query,
    })
  }

  const selectedGroupText = () => {
    return `Group: ${filters.group?.displayText}`
  }

  const selectedPeriodText = () => {
    return `Time Frame: ${filters.period?.displayText}`
  }

  /**
   * Resets the group filter selection to the default group selection
   */
  const resetGroupFilterSelection = () => {
    setFilters({
      ...filters,
      group: groupSelections?.find((obj: GroupSelection) => obj.type === DEFAULT_GROUP_TYPE),
    })
  }

  /**
   * Removes group by options from the dropdown based on the search query. For example,
   * if a user is searching for a particular SKU, group by product/SKU won't make much sense
   * so we remove the options.
   *
   * We also use this to avoid querying partitions that might not be in place yet.
   */
  const getGroupSelections = (): GroupSelection[] => {
    // filter out all options except for group by SKU and None when product is present
    if (filters.searchQuery.includes('product:')) {
      groupSelections = groupSelections.filter(
        group => group.type === GROUP_BY_SKU_TYPE || group.type === GROUP_BY_NONE_TYPE,
      )
    }

    // filter out all options except for None when sku is present
    if (filters.searchQuery.includes('sku:')) {
      groupSelections = groupSelections.filter(group => group.type === GROUP_BY_NONE_TYPE)
    }

    // filter out org/repo groupings if the user is searching for a specific org or repo
    if (filters.searchQuery.includes('org:') || filters.searchQuery.includes('repo:')) {
      groupSelections = groupSelections.filter(
        group => group.type !== GROUP_BY_ORG_TYPE && group.type !== GROUP_BY_REPO_TYPE,
      )
    }

    // if the route is an org, then hide the organization group
    if (customer.customerType === 'Organization') {
      groupSelections = groupSelections.filter(group => group.type !== GROUP_BY_ORG_TYPE)
    }

    // check if the current group selection exists in the filtered group selections, if it does not, we want to
    // fallback to the default selection as it was likely removed by the above
    const currentFilterGroupExists = groupSelections.some(group => group.type === filters.group?.type)
    if (!currentFilterGroupExists) {
      resetGroupFilterSelection()
    }

    return groupSelections
  }

  return (
    <Box
      sx={{
        ...containerStyle,
        ...sx,
      }}
      data-testid="usage-filters"
    >
      {showSearch && (
        <UsageSearchBar
          setSearchQuery={setSearchQuery}
          customer={customer}
          searchQuery={filters.searchQuery}
          useUsageChartDataEndpoint={useUsageChartDataEndpoint}
        />
      )}

      {filters.group && (
        <Box
          sx={{
            ml: [0, 0, 2],
            mt: [2, 2, 0],
          }}
        >
          <ActionMenu>
            <ActionMenu.Button sx={{width: ['100%', '100%', 'auto']}}>{selectedGroupText()}</ActionMenu.Button>
            <ActionMenu.Overlay align="end">
              <ActionList selectionVariant="single" showDividers>
                {getGroupSelections().map(group => (
                  <ActionList.Item
                    key={group.type}
                    onSelect={() => setFilters({...filters, group})}
                    selected={group.type === filters.group?.type}
                  >
                    {group.displayText}
                  </ActionList.Item>
                ))}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </Box>
      )}

      {filters.period && (
        <Box
          sx={{
            ml: [0, 0, 2],
            mt: [2, 2, 0],
          }}
        >
          <ActionMenu>
            <ActionMenu.Button sx={{width: ['100%', '100%', 'auto']}}>{selectedPeriodText()}</ActionMenu.Button>
            <ActionMenu.Overlay align="end">
              <ActionList selectionVariant="single" showDividers>
                {periodSelections.map(period => (
                  <ActionList.Item
                    key={period.type}
                    onSelect={() => setFilters({...filters, period})}
                    selected={period === filters.period}
                  >
                    {period.displayText}
                  </ActionList.Item>
                ))}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </Box>
      )}
    </Box>
  )
}
