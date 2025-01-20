import type {Iteration, IterationInterval} from '../../../../api/columns/contracts/iteration'
import {buildBreak} from '../../../../helpers/iterations'
import {IterationRowSkeleton} from './iteration-row-skeleton'

type IterationBreakRowProps = {
  /**
   * Callback to fire when the break is changed by the user. Called with the updated break
   * interval data.
   */
  onChange: (interval: IterationInterval) => void
  /**
   * The iteration that precedes the "break". This is required because a break can only
   * exist between two iterations.
   */
  localPreviousIteration: Iteration
  /**
   * The iteration that follows the "break". This is required because a break can only
   * exist between two iterations.
   */
  localNextIteration: Iteration
  /**
   * If the break existed before, this is the iteration that preceded it before any unsaved
   * local changes were made.
   */
  originalPreviousIteration?: Iteration
  /**
   * If the break existed before, this is the iteration that followed it before any unsaved
   * local changes were made.
   */
  originalNextIteration?: Iteration
}

export function IterationBreakRow({
  onChange,
  localPreviousIteration,
  localNextIteration,
  originalPreviousIteration,
  originalNextIteration,
}: IterationBreakRowProps) {
  const localBreakInterval = buildBreak(localPreviousIteration, localNextIteration)
  if (!localBreakInterval) return <></>

  const originalBreakInterval = buildBreak(originalPreviousIteration, originalNextIteration)

  return (
    <IterationRowSkeleton
      localInterval={localBreakInterval}
      originalInterval={originalBreakInterval}
      localPreviousInterval={localPreviousIteration}
      labelType="break"
      onRemove={() => onChange({...localBreakInterval, duration: 0})}
      onIntervalChange={onChange}
    />
  )
}
