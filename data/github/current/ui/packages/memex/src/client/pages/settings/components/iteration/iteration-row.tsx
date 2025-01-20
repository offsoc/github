import isEqual from 'lodash-es/isEqual'
import {useMemo} from 'react'

import type {Iteration} from '../../../../api/columns/contracts/iteration'
import {getIterationLabelType} from '../../../../helpers/iterations'
import {IterationRowSkeleton} from './iteration-row-skeleton'

type IterationRowProps = {
  /** The iteration details to render for the row */
  iteration: Iteration
  /** Callback to fire when the iteration is changed by the user */
  onChange: (updatedIteration: Iteration) => void
  /** Callback to fire when the user removes the iteration from the array */
  onRemove: () => void
  /**
   * Was this iteration originally marked completed? We accept the server state for this
   * because it may, in rare edge cases, be different from the client state (mostly due to
   * time zones).
   */
  originalIsCompleted?: boolean
  /** The previous iteration in the series, if there is one. To prevent overlap when editing date range */
  previousIteration?: Iteration
  /** Original iteration if local configuration changes */
  originalIteration?: Iteration

  children: JSX.Element | null
}

export function IterationRow({
  iteration,
  onRemove,
  onChange,
  originalIsCompleted = false,
  previousIteration,
  originalIteration,
  children,
}: IterationRowProps) {
  const isDirty = useMemo(() => !isEqual(iteration, originalIteration), [iteration, originalIteration])
  const labelType = getIterationLabelType(iteration, isDirty ? undefined : originalIsCompleted)

  return (
    <IterationRowSkeleton
      localTitle={iteration.title}
      originalTitle={originalIteration?.title}
      localInterval={iteration}
      originalInterval={originalIteration}
      localPreviousInterval={previousIteration}
      labelType={labelType}
      onRemove={onRemove}
      onTitleChange={title => onChange({...iteration, title})}
      onIntervalChange={interval => onChange({...iteration, ...interval})}
    >
      {children}
    </IterationRowSkeleton>
  )
}
