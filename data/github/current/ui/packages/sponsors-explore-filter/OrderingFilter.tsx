import {testIdProps} from '@github-ui/test-id-props'
import {ActionMenu, ActionList} from '@primer/react'

export interface Orderings {
  [key: string]: {label: string}
}

export interface OrderingFilterProps {
  orderings: Orderings
  orderingFilter: string
  setOrderingFilter: (ordering: string) => void
}

export function OrderingFilter({orderings, orderingFilter, setOrderingFilter}: OrderingFilterProps) {
  const onOrderingChange = (event: React.UIEvent, ordering: string) => {
    setOrderingFilter(ordering)
  }

  const getLabel = (ordering: string) => {
    return orderings[ordering]?.label || 'Unknown'
  }

  return (
    <ActionMenu>
      <ActionMenu.Button aria-label={`Order by: ${getLabel(orderingFilter)}`} {...testIdProps('ordering-button')}>
        {getLabel(orderingFilter)}
      </ActionMenu.Button>
      <ActionMenu.Overlay width="medium">
        <ActionList selectionVariant="single" role="listbox">
          {Object.entries(orderings).map(([k, ordering]) => (
            <ActionList.Item
              key={k}
              role="option"
              selected={k === orderingFilter}
              aria-selected={k === orderingFilter}
              onSelect={event => {
                onOrderingChange(event, k)
              }}
              {...testIdProps(`ordering-${k}`)}
            >
              {ordering.label}
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
