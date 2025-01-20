import type {KeyboardEventHandler} from 'react'
import {useState, useCallback, useRef, useContext} from 'react'
import {useRelayEnvironment} from 'react-relay'
import {QueryBuilder} from '@github-ui/query-builder/QueryBuilder'
import {useDebounce} from '@github-ui/use-debounce'
import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {EnterpriseOrgFilterProvider} from '@github-ui/query-builder/providers/billing/enterprise-org-filter-provider'
import {EnterpriseRepoFilterProvider} from '@github-ui/query-builder/providers/billing/enterprise-repo-filter-provider'
import {BillingProductFilterProvider} from '@github-ui/query-builder/providers/billing/billing-product-filter-provider'
import {BillingSKUFilterProvider} from '@github-ui/query-builder/providers/billing/billing-sku-filter-provider'
import {BillingCostCenterFilterProvider} from '@github-ui/query-builder/providers/billing/billing-costcenter-filter-provider'

import type {Customer} from '../../types/common'
import {PageContext} from '../../App'

interface Props {
  customer: Customer
  searchQuery: string
  setSearchQuery: (query: string) => void
  useUsageChartDataEndpoint: boolean
}

const UsageSearchBar = ({customer, setSearchQuery, searchQuery, useUsageChartDataEndpoint}: Props) => {
  const [inputQuery, setInputQuery] = useState<string>(searchQuery)
  const relayEnvironment = useRelayEnvironment()
  const ref = useRef(null)
  const isEnterpriseRoute = useContext(PageContext).isEnterpriseRoute

  /**
   * Populates the search dropdown with the filters (org, repo, product, sku) and
   * their respective values.
   *
   * TODO: This needs additional logic considerations for Orgs and Individuals
   */
  const onRequestProvider = useCallback(
    (event: Event) => {
      event.stopPropagation()
      const queryBuilder = event.target as QueryBuilderElement

      // only display organization filters and Cost Center data if is Enterprise
      if (isEnterpriseRoute) {
        // Current enterprise organization data from GraphQL
        new EnterpriseOrgFilterProvider(queryBuilder, {
          name: 'Organization',
          value: 'org',
          slug: customer.displayId,
          priority: 2,
          relayEnvironment,
        })

        if (useUsageChartDataEndpoint) {
          // Cost Center data from billing-platform (non-GQL)
          new BillingCostCenterFilterProvider(queryBuilder, {
            name: 'Cost Center',
            value: 'cost_center',
            slug: customer.displayId,
            priority: 1,
          })
        }
      }

      // Current enterprise repository data from GraphQL
      new EnterpriseRepoFilterProvider(queryBuilder, {
        name: 'Repository',
        value: 'repo',
        slug: customer.displayId,
        priority: 3,
        relayEnvironment,
      })

      // Product/SKU data from billing-platform (non-GQL)
      new BillingProductFilterProvider(queryBuilder, {
        name: 'Product',
        value: 'product',
        slug: customer.displayId,
        priority: 4,
      })

      new BillingSKUFilterProvider(queryBuilder, {name: 'SKU', value: 'sku', slug: customer.displayId, priority: 5})
    },
    [customer.displayId, relayEnvironment, isEnterpriseRoute, useUsageChartDataEndpoint],
  )

  // Create a debounced version of setSearchQuery that waits 400ms after the last call to execute
  const debouncedSetSearchQuery = useDebounce(setSearchQuery, 400)

  const onChangeHandler: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    event => {
      const currentInputQuery = inputQuery
      const newInputQuery = event.currentTarget.value

      if (newInputQuery !== currentInputQuery) {
        // Usage was cleared, we should reset the query value
        if (newInputQuery === '') {
          setSearchQuery('')
          setInputQuery('')
          return
        }

        setInputQuery(newInputQuery)
        // Only submit the query if the user has finished typing/selecting a filter and the filter has at least some
        // value attached (e.g. "org:github").
        const searchCount = newInputQuery.split(':').length - 1
        if (newInputQuery && newInputQuery.includes(':') && !newInputQuery.trim().endsWith(':') && searchCount === 1) {
          debouncedSetSearchQuery(newInputQuery.trim())
        }
      }
    },
    [inputQuery, setSearchQuery, debouncedSetSearchQuery],
  )

  const handleEnterKeyPress: KeyboardEventHandler = useCallback(
    event => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic -- manual shortcut logic is idiomatic in React
      if (event.key !== 'Enter') return
      event.preventDefault()
      const searchCount = inputQuery.split(':').length - 1
      if (searchCount === 1) {
        setSearchQuery(inputQuery.trim())
      }
    },
    [inputQuery, setSearchQuery],
  )

  return (
    <QueryBuilder
      id="usage-query-builder"
      label="Search or filter usage (chart updates as you type)"
      onChange={onChangeHandler}
      onKeyPress={handleEnterKeyPress}
      inputValue={inputQuery}
      placeholder="Search or filter usage"
      onRequestProvider={onRequestProvider}
      data-testid="search-usage"
      inputRef={ref}
    />
  )
}

export default UsageSearchBar
