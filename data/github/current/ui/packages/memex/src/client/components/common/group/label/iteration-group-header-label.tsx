import {testIdProps} from '@github-ui/test-id-props'
import {Text, themeGet} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import type {Iteration} from '../../../../api/columns/contracts/iteration'
import {formatShortDate, intervalDateRange, isCurrentIteration} from '../../../../helpers/iterations'
import {formatISODateString} from '../../../../helpers/parsing'
import type {FieldAggregate} from '../../../../hooks/use-aggregation-settings'
import {CurrentIterationLabel} from '../../../fields/iteration/iteration-label'
import {AggregateLabels} from '../../aggregate-labels'
import {SanitizedGroupHeaderText} from '../sanitized-group-header-text'

type Props = {
  iteration: Iteration
  rowCount: number
  hideItemsCount: boolean
  aggregates: Array<FieldAggregate>
  titleSx?: BetterSystemStyleObject
}

export function IterationGroupHeaderLabel({iteration, rowCount, aggregates, hideItemsCount, titleSx}: Props) {
  const title = iteration.titleHtml
  const dates = intervalDateRange(iteration)
  const isCurrent = isCurrentIteration(new Date(), iteration)

  return (
    <>
      <SanitizedGroupHeaderText titleHtml={title} sx={titleSx} />
      <AggregateLabels
        counterSx={{color: 'fg.muted'}}
        itemsCount={rowCount}
        aggregates={aggregates}
        hideItemsCount={hideItemsCount}
      />
      {dates && (
        <Text
          sx={{
            color: 'fg.muted',
            ml: 2,
            fontSize: themeGet('fontSizes.1'),
            textAlign: 'left',
            whiteSpace: 'nowrap',
            minWidth: 0,
            overflow: 'hidden',
            code: {
              fontFamily: 'fonts.mono',
              fontSize: 0,
            },
          }}
          {...testIdProps(`group-name-subtitle`)}
        >
          <time dateTime={formatISODateString(dates.startDate)}>{formatShortDate(dates.startDate)}</time>
          {` - `}
          <time dateTime={formatISODateString(dates.endDate)}>{formatShortDate(dates.endDate)}</time>
        </Text>
      )}
      {isCurrent && <CurrentIterationLabel sx={{ml: 2}} />}
    </>
  )
}
