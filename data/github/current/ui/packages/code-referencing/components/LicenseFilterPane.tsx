import {useSearchParams} from '@github-ui/use-navigate'
import React from 'react'

import {LawIcon} from '@primer/octicons-react'
import {ActionList, CounterLabel, Text} from '@primer/react'

type Item = {label: string; key: string; count: number}

const NEGATE_LICENSE_PARAM = 'exclude_licenses'

export function LicenseFilterPane(props: {items: Item[]}) {
  const [params, setParams] = useSearchParams()

  const negatedLicenses = React.useMemo(
    () => params.get(NEGATE_LICENSE_PARAM)?.split(',').filter(Boolean) ?? [],
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [params.get(NEGATE_LICENSE_PARAM)],
  )

  const licenses = React.useMemo<Array<Item & {selected: boolean}>>(
    () =>
      props.items.map(item => ({
        ...item,
        selected: !negatedLicenses.includes(item.key),
      })),
    [negatedLicenses, props.items],
  )

  const onSelect = (item: Item) => {
    setParams(
      prev => {
        const next = negatedLicenses
        const nextItemIndex = next.indexOf(item.key)

        // If the item is already selected, remove it from the list
        if (nextItemIndex !== -1) next.splice(nextItemIndex, 1)
        // else add it
        else next.push(item.key)

        if (next.length > 0) prev.set(NEGATE_LICENSE_PARAM, next.join(','))
        else prev.delete(NEGATE_LICENSE_PARAM)

        // If the filter param changes, we need to remove pagination params from the URL — so we reset back to page 1.
        prev.delete('page')

        return prev
      },
      {
        preventScrollReset: true,
        replace: true,
      },
    )
  }

  if (licenses.length === 0) {
    return (
      <Text as="p" sx={{marginLeft: 3, color: 'fg.subtle'}}>
        No licenses available
      </Text>
    )
  }

  return (
    <ActionList selectionVariant="multiple">
      <ActionList.Group>
        <ActionList.GroupHeading as="h3">Repository license</ActionList.GroupHeading>
        {licenses.map(entry => (
          // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
          <ActionList.Item key={entry.key} selected={entry.selected} onSelect={() => onSelect(entry)}>
            <ActionList.LeadingVisual>
              <LawIcon />
            </ActionList.LeadingVisual>
            {entry.label}
            <ActionList.TrailingVisual>
              <CounterLabel>{entry.count}</CounterLabel>
            </ActionList.TrailingVisual>
          </ActionList.Item>
        ))}
      </ActionList.Group>
    </ActionList>
  )
}
