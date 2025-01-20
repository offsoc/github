import {useState} from 'react'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {testIdProps} from '@github-ui/test-id-props'
import {useNavigate} from '@github-ui/use-navigate'
import {Box, Button, Heading} from '@primer/react'
import type {SxProp} from '@primer/react'
import {AccountFilter} from './AccountFilter'
import type {Accounts} from './AccountFilter'
import {EcosystemsFilter} from './EcosystemsFilter'
import type {Ecosystems} from './EcosystemsFilter'
import {OrderingFilter} from './OrderingFilter'
import type {Orderings} from './OrderingFilter'
import {DirectOnlyFilter} from './DirectOnlyFilter'

export interface SponsorsExploreFilterProps {
  accounts: Accounts
  selectedAccount: string
  ecosystems: Ecosystems
  selectedEcosystems: string[]
  orderings: Orderings
  selectedOrdering: string
  directDependenciesOnly: boolean
}

export function SponsorsExploreFilter({
  accounts,
  selectedAccount,
  ecosystems,
  selectedEcosystems,
  orderings,
  selectedOrdering,
  directDependenciesOnly,
}: SponsorsExploreFilterProps) {
  const [accountFilter, setAccountFilter] = useState<string>(selectedAccount)
  const [ecosystemsFilter, setEcosystemsFilter] = useState<string[]>(selectedEcosystems)
  const [orderingFilter, setOrderingFilter] = useState<string>(selectedOrdering)
  const [directOnlyFilter, setDirectOnlyFilter] = useState<boolean>(directDependenciesOnly)

  const navigate = useNavigate()

  const onSubmit = (e: React.FormEvent<EventTarget>) => {
    e.preventDefault()
    const params = {
      ...(accountFilter && {account: accountFilter}),
      ...(ecosystemsFilter.length && {ecosystems: ecosystemsFilter.join(',')}),
      ...(orderingFilter && {sort_by: orderingFilter}),
      ...(!directOnlyFilter && {direct: '0'}),
    }
    const filterParams = new URLSearchParams(params).toString()

    navigate(`${ssrSafeLocation.pathname}?${filterParams}`)
  }

  const leftPadding: SxProp['sx'] = {paddingLeft: 2}
  const headerStyle: SxProp['sx'] = {fontSize: 3, color: 'default', paddingY: 3, ...leftPadding}

  return (
    <form onSubmit={onSubmit} {...testIdProps('sponsors-explore-filter')}>
      <Heading as="h2" sx={headerStyle}>
        Explore as
      </Heading>
      <Box sx={{...leftPadding}}>
        <AccountFilter accounts={accounts} accountFilter={accountFilter} setAccountFilter={setAccountFilter} />
      </Box>
      <Heading as="h2" sx={headerStyle}>
        Ecosystems
      </Heading>
      <Box sx={{...leftPadding}}>
        <EcosystemsFilter
          ecosystems={ecosystems}
          ecosystemsFilter={ecosystemsFilter}
          setEcosystemsFilter={setEcosystemsFilter}
        />
      </Box>
      <Heading as="h2" sx={headerStyle}>
        Order by
      </Heading>
      <Box sx={{...leftPadding}}>
        <OrderingFilter orderings={orderings} orderingFilter={orderingFilter} setOrderingFilter={setOrderingFilter} />
      </Box>
      <Box sx={{paddingTop: 4, ...leftPadding}}>
        <DirectOnlyFilter directOnlyFilter={directOnlyFilter} setDirectOnlyFilter={setDirectOnlyFilter} />
      </Box>

      <Box sx={{paddingTop: 3, ...leftPadding}}>
        <Button type="submit" variant="primary" {...testIdProps('sponsors-explore-filter-button')}>
          Apply
        </Button>
      </Box>
    </form>
  )
}
