import {useCallback, useMemo, useState} from 'react'
import {testIdProps} from '@github-ui/test-id-props'
import {CircleSlashIcon, TriangleDownIcon} from '@primer/octicons-react'
import {Button, FormControl, SelectPanel} from '@primer/react'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'

export interface SponsorsNewslettersProps {
  tiers: Tiers
}

interface Tiers {
  [id: string]: Tier
}

interface Tier {
  id: string
  name: string
  monthlyPriceInCents: number
  frequency: string
  state: string
  subscriptionCount: number
}

export function SponsorsNewsletters({tiers}: SponsorsNewslettersProps) {
  const ACTIVE_STATES = useMemo(() => ['published', 'custom'], [])
  const RETIRED_STATE = 'retired'
  const RECURRING_FREQUENCY = 'recurring'
  const ONE_TIME_FREQUENCY = 'one_time'

  const getRecipientCount = useCallback((tierValues: Tier[]) => {
    return tierValues.map(tier => tier.subscriptionCount).reduce((acc, count) => acc + count, 0)
  }, [])
  const allTierValues = useMemo(() => Object.values(tiers), [tiers])
  const oneTimeTierValues = useMemo(
    () => allTierValues.filter(tier => tier.frequency === ONE_TIME_FREQUENCY),
    [allTierValues],
  )
  const recurringTierValues = useMemo(
    () => allTierValues.filter(tier => tier.frequency === RECURRING_FREQUENCY),
    [allTierValues],
  )
  const getTierTextSuffix = useCallback((subscriptionCount: number) => {
    const sponsorText = subscriptionCount === 1 ? 'sponsor' : 'sponsors'
    return `(${subscriptionCount} ${sponsorText})`
  }, [])
  const getTierText = useCallback(
    (tier: Tier) => {
      const prefix = tier.state === 'retired' ? '[retired] ' : ''
      return `${prefix}${tier.name} ${getTierTextSuffix(tier.subscriptionCount)}`
    },
    [getTierTextSuffix],
  )

  const allTiersInput = useMemo(() => {
    const recipientCount = getRecipientCount(allTierValues)
    return {
      key: 'all',
      text: `All sponsors ${getTierTextSuffix(recipientCount)}`,
      showDivider: false,
    }
  }, [allTierValues, getRecipientCount, getTierTextSuffix])

  const [selectedInputs, setSelectedInputs] = useState<ItemInput[]>([allTiersInput])
  const [selectedTiers, setSelectedTiers] = useState<Tier[]>(allTierValues)
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState('')

  const noMatchesItem = useMemo(() => {
    return {
      leadingVisual: CircleSlashIcon,
      text: 'No matches',
      disabled: true,
      selected: undefined, // hide checkbox
      key: 'no-matches',
      id: 'no-matches',
    }
  }, [])
  const recurringTiersInput = useMemo(() => {
    const recipientCount = getRecipientCount(recurringTierValues)
    return {
      key: 'recurring',
      text: `Recurring sponsors ${getTierTextSuffix(recipientCount)}`,
      showDivider: false,
    }
  }, [getRecipientCount, getTierTextSuffix, recurringTierValues])
  const oneTimeTiersInput = useMemo(() => {
    const recipientCount = getRecipientCount(oneTimeTierValues)
    return {
      key: 'one-time',
      text: `One-time sponsors ${getTierTextSuffix(recipientCount)}`,
      showDivider: false,
    }
  }, [getRecipientCount, getTierTextSuffix, oneTimeTierValues])

  const getTierInputs = useMemo(
    () => (tierFilter: (tier: {frequency: string; state: string}) => boolean) => {
      return allTierValues
        .filter(tierFilter)
        .sort((a, b) => (a.monthlyPriceInCents > b.monthlyPriceInCents ? 1 : -1))
        .map((tier, index) => ({
          key: tier.id,
          text: getTierText(tier),
          showDivider: index === 0,
        }))
    },
    [allTierValues, getTierText],
  )
  const activeRecurringTiers = useMemo(
    () => getTierInputs(tier => ACTIVE_STATES.includes(tier.state) && tier.frequency === RECURRING_FREQUENCY),
    [ACTIVE_STATES, getTierInputs],
  )
  const activeOneTimeTiers = useMemo(
    () => getTierInputs(tier => ACTIVE_STATES.includes(tier.state) && tier.frequency === ONE_TIME_FREQUENCY),
    [ACTIVE_STATES, getTierInputs],
  )
  const retiredRecurringTiers = useMemo(
    () => getTierInputs(tier => tier.state === RETIRED_STATE && tier.frequency === RECURRING_FREQUENCY),
    [getTierInputs],
  )
  const retiredOneTimeTiers = useMemo(
    () => getTierInputs(tier => tier.state === RETIRED_STATE && tier.frequency === ONE_TIME_FREQUENCY),
    [getTierInputs],
  )
  const aggregateTierInputs = useMemo(
    () => [allTiersInput, recurringTiersInput, oneTimeTiersInput],
    [allTiersInput, oneTimeTiersInput, recurringTiersInput],
  )
  const aggregateInputKeys = useMemo(() => aggregateTierInputs.map(tierInput => tierInput.key), [aggregateTierInputs])
  const isAggregateInput = useMemo(() => {
    if (selectedInputs.length !== 1) return false
    const selectedInputKey = selectedInputs[0]?.key?.toString()
    return !!selectedInputKey && aggregateInputKeys.includes(selectedInputKey)
  }, [aggregateInputKeys, selectedInputs])
  const items = useMemo(() => {
    return [
      ...aggregateTierInputs,
      ...activeRecurringTiers,
      ...activeOneTimeTiers,
      ...retiredRecurringTiers,
      ...retiredOneTimeTiers,
    ]
  }, [
    aggregateTierInputs,
    activeRecurringTiers,
    activeOneTimeTiers,
    retiredRecurringTiers,
    retiredOneTimeTiers,
  ]) as ItemInput[]

  const filteredItems = useMemo(() => {
    if (!filter) return items
    const matchesFilter = (item: ItemInput) => (item.text || '').toLowerCase().includes(filter.toLocaleLowerCase())
    const filtered = filter ? items.filter(matchesFilter) : items
    if (filtered.length === 0) {
      return [noMatchesItem]
    } else {
      return filtered
    }
  }, [filter, items, noMatchesItem])

  // this design isn't great for wanting to handle our aggregate selections, the idea is that if folks make
  // an aggregate selection, we clear all others. If they make a non-aggregate selection, we clear all aggregates.
  const onSelectedChange = (selections: ItemInput[]) => {
    // assume that if we have no selections, we want to select all tiers
    if (selections.length === 0) {
      setSelectedInputs([allTiersInput])
      setSelectedTiers(allTierValues)
      return
    }

    // when a selection is added, special case aggregate selections
    if (selections.length > selectedInputs.length) {
      const selectedInputKey = selections.find(x => !selectedInputs.includes(x))?.key?.toString()
      if (selectedInputKey && aggregateInputKeys.includes(selectedInputKey)) {
        switch (selectedInputKey) {
          case allTiersInput.key:
            setSelectedInputs([allTiersInput])
            setSelectedTiers(allTierValues)
            return
          case recurringTiersInput.key:
            setSelectedInputs([recurringTiersInput])
            setSelectedTiers(recurringTierValues)
            return
          case oneTimeTiersInput.key:
            setSelectedInputs([oneTimeTiersInput])
            setSelectedTiers(oneTimeTierValues)
            return
        }
      }
    }

    // otherwise, preserve changes while filtering out aggregate inputs
    const nonAggregateSelections = selections.filter(
      item => item.key && !aggregateInputKeys.includes(item.key.toString()),
    )
    setSelectedTiers(
      nonAggregateSelections.map(
        item =>
          item.key &&
          // @ts-expect-error bigint cannot index
          tiers[item.key],
      ) as Tier[],
    )
    setSelectedInputs(nonAggregateSelections)
  }

  const renderAnchor = <T extends React.HTMLAttributes<HTMLElement>>(props: T) => {
    let text = ''
    if (isAggregateInput) {
      text = selectedInputs[0]?.text || 'Select recipients'
    } else {
      const recipientCount = getRecipientCount(selectedTiers)
      text = `${selectedTiers.map(tier => tier.name).join('; ')} ${getTierTextSuffix(recipientCount)}`
    }
    return (
      <Button trailingAction={TriangleDownIcon} {...props}>
        {text}
      </Button>
    )
  }

  return (
    <FormControl>
      <FormControl.Label>Send email to</FormControl.Label>
      <SelectPanel
        title="Select recipients"
        items={filteredItems}
        open={isOpen}
        onOpenChange={(open: boolean) => setIsOpen(open)}
        onFilterChange={setFilter}
        selected={selectedInputs}
        onSelectedChange={onSelectedChange}
        renderAnchor={renderAnchor}
        overlayProps={{width: 'medium'}}
        showItemDividers
      />
      {selectedTiers.map(tier => (
        <input
          key={tier.id}
          type="hidden"
          name="newsletter[tier_ids][]"
          value={tier.id}
          {...testIdProps('newsletter-tier-input')}
        />
      ))}
    </FormControl>
  )
}
