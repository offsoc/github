import {useMemo, useState} from 'react'
import {CircleSlashIcon, TriangleDownIcon} from '@primer/octicons-react'
import {Button, SelectPanel} from '@primer/react'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'

export interface SponsorsDashboardYourSponsorsProps {
  tiers: Tiers
  defaultPath: string
  selectedTierId?: string
}

interface Tiers {
  [id: string]: Tier
}

interface Tier {
  id: string
  selected: boolean
  name: string
  monthlyPriceInCents: number
  frequency: string
  state: string
  subscriptionCount: number
  href: string
}

const noMatchesItem: ItemInput = {
  leadingVisual: CircleSlashIcon,
  text: 'No matches',
  disabled: true,
  selected: undefined, // hide checkbox
  id: 'no-matches',
  key: 'no-matches',
}
const getTierText = (tier: Tier) => {
  const prefix = tier.state === RETIRED_STATE ? '[retired] ' : ''
  const sponsorText = tier.subscriptionCount === 1 ? 'sponsor' : 'sponsors'
  const suffix = ` (${tier.subscriptionCount} ${sponsorText})`
  return `${prefix}${tier.name}${suffix}`
}
const RETIRED_STATE = 'retired'

export function SponsorsDashboardYourSponsors({
  tiers,
  defaultPath,
  selectedTierId,
}: SponsorsDashboardYourSponsorsProps) {
  const sortedItems: ItemInput[] = useMemo(() => {
    return Object.values(tiers)
      .sort((a, b) => (a.subscriptionCount < b.subscriptionCount ? 1 : -1))
      .map(tier => ({
        key: tier.id,
        id: tier.id,
        text: getTierText(tier),
      }))
  }, [tiers])
  const allTiersItem: ItemInput = useMemo(() => {
    const sponsorCount = Object.values(tiers)
      .map(tier => tier.subscriptionCount)
      .reduce((acc, count) => acc + count, 0)
    const sponsorText = sponsorCount === 1 ? 'sponsor' : 'sponsors'
    const suffix = `(${sponsorCount} ${sponsorText})`
    return {
      key: 'all',
      text: `All sponsors ${suffix}`,
    }
  }, [tiers])
  const items = useMemo(() => {
    return [allTiersItem, ...sortedItems]
  }, [allTiersItem, sortedItems])
  const selectedItem = items.find(item => item.key === selectedTierId) || allTiersItem

  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<ItemInput | undefined>(selectedItem)

  const filteredItems = useMemo(() => {
    if (!filter) return items
    const matchesFilter = (item: ItemInput) => (item.text || '').toLowerCase().includes(filter.toLocaleLowerCase())
    const filtered = filter ? items.filter(matchesFilter) : items
    if (filtered.length === 0) {
      return [noMatchesItem]
    } else {
      return filtered
    }
  }, [filter, items])

  const renderAnchor = <T extends React.HTMLAttributes<HTMLElement>>(props: T) => {
    return (
      <Button trailingAction={TriangleDownIcon} {...props}>
        Filter: {selected?.text || 'select filter'}
      </Button>
    )
  }

  const handleSelectedChange = (item: ItemInput | undefined) => {
    setSelected(item)
    // HACK HACK HACK I couldn't get ActionList.LinkItems to respect keyboard nav, so
    // this opts to force ActionList.Items to behave as links instead.
    const itemKey = item?.key || 'all'
    // @ts-expect-error BigInt is not allowed as an index
    const path = tiers[itemKey]?.href || defaultPath
    window.location.href = path
  }

  return (
    <SelectPanel
      title="Select recipients"
      renderAnchor={renderAnchor}
      placeholderText="Filter tiers"
      items={filteredItems}
      open={open}
      onOpenChange={setOpen}
      onFilterChange={setFilter}
      selected={selected}
      onSelectedChange={handleSelectedChange}
      overlayProps={{width: 'medium'}}
    />
  )
}
