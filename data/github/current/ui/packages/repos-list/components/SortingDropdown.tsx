import {
  type Icon,
  KebabHorizontalIcon,
  RepoPushIcon,
  SortAscIcon,
  SortDescIcon,
  StarIcon,
  TypographyIcon,
} from '@primer/octicons-react'
import {ActionList, ActionMenu, IconButton, useResponsiveValue} from '@primer/react'
import type {ResponsiveValue} from '@primer/react/lib-esm/hooks/useResponsiveValue'

interface OrderOptions {
  label: string
  defaultDirection: 'asc' | 'desc'
  icon: Icon
}

const defaultSortingKey = 'updated'

const sortingOptions: Record<string, OrderOptions> = {
  updated: {label: 'Last pushed', defaultDirection: 'desc', icon: RepoPushIcon},
  name: {label: 'Name', defaultDirection: 'asc', icon: TypographyIcon},
  stars: {label: 'Stars', defaultDirection: 'desc', icon: StarIcon},
}

export function SortingDropdown({
  sortingItemSelected,
  onSortingItemSelect,
}: {
  sortingItemSelected: string
  onSortingItemSelect: (key: string) => void
}) {
  const [field, direction] = getSortingKeyAndDirection(sortingItemSelected)
  const isAscending = direction === 'asc'
  const orderIcon = isAscending ? SortAscIcon : SortDescIcon

  function select(newField: string, newDirection: 'asc' | 'desc') {
    if (newDirection === 'asc') {
      onSortingItemSelect(`${newField}-asc`)
    } else if (newField === 'updated') {
      onSortingItemSelect('')
    } else {
      onSortingItemSelect(newField)
    }
  }

  const buttonLabel = getSortingOptionLabel(field)
  const buttonAriaLabel = `Sort by ${buttonLabel} ${isAscending ? 'ascending' : 'descending'}`

  const regularAnchor = (
    <ActionMenu.Button
      leadingVisual={orderIcon}
      sx={{color: 'fg.muted'}}
      variant="invisible"
      aria-label={buttonAriaLabel}
    >
      {buttonLabel}
    </ActionMenu.Button>
  )

  const anchor: JSX.Element = useResponsiveValue<ResponsiveValue<JSX.Element>, JSX.Element>(
    {
      narrow: (
        <ActionMenu.Anchor>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            icon={KebabHorizontalIcon}
            variant="invisible"
            aria-label={buttonAriaLabel}
            unsafeDisableTooltip={true}
          />
        </ActionMenu.Anchor>
      ),
      regular: regularAnchor,
    },
    regularAnchor,
  )

  return (
    <ActionMenu>
      {anchor}
      <ActionMenu.Overlay>
        <ActionList selectionVariant="single">
          {Object.entries(sortingOptions).map(([key, {label, defaultDirection, icon: FieldIcon}]) => (
            <ActionList.Item key={key} selected={key === field} onSelect={() => select(key, defaultDirection)}>
              <ActionList.LeadingVisual>
                <FieldIcon />
              </ActionList.LeadingVisual>
              {label}
            </ActionList.Item>
          ))}
          <ActionList.Divider />
          <ActionList.Item key="ascending" selected={isAscending} onSelect={() => select(field, 'asc')}>
            <ActionList.LeadingVisual>
              <SortAscIcon />
            </ActionList.LeadingVisual>
            Ascending
          </ActionList.Item>
          <ActionList.Item key="descending" selected={!isAscending} onSelect={() => select(field, 'desc')}>
            <ActionList.LeadingVisual>
              <SortDescIcon />
            </ActionList.LeadingVisual>
            Descending
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

const ascendingSuffix = '-asc'

export function getSortingOptionLabel(sortingKey: string) {
  return sortingOptions[sortingKey]?.label || sortingKey
}

export function getSortingKeyAndDirection(sorting: string) {
  const selectedKey = sorting || defaultSortingKey
  return splitOrderDirection(selectedKey)
}

function splitOrderDirection(value: string): [string, string] {
  if (value.endsWith(ascendingSuffix)) {
    return [value.substring(0, value.length - ascendingSuffix.length), 'asc']
  }

  return [value, '']
}
