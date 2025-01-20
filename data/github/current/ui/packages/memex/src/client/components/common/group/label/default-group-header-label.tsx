import {testIdProps} from '@github-ui/test-id-props'
import {Label} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import type {FieldAggregate} from '../../../../hooks/use-aggregation-settings'
import {AggregateLabels} from '../../aggregate-labels'
import {SanitizedGroupHeaderText} from '../sanitized-group-header-text'

type Props = {
  titleHtml: string
  label?: string
  rowCount: number
  hideItemsCount: boolean
  aggregates: Array<FieldAggregate>
  titleSx?: BetterSystemStyleObject
}

/**
 * This is our default group header for situations where we don't have access
 * to any "rich" model for rendering the header
 */
export function DefaultGroupHeaderLabel({titleHtml, label, rowCount, hideItemsCount, aggregates, titleSx}: Props) {
  return (
    <>
      <SanitizedGroupHeaderText titleHtml={titleHtml} sx={titleSx} />
      {label && (
        <Label sx={{color: 'accent.fg'}} {...testIdProps(`table-group-label`)}>
          {label}
        </Label>
      )}
      <AggregateLabels
        counterSx={{color: 'fg.muted'}}
        itemsCount={rowCount}
        aggregates={aggregates}
        hideItemsCount={hideItemsCount}
      />
    </>
  )
}
