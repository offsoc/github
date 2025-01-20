import {unstable_scheduleCallback, unstable_LowPriority} from 'scheduler'

/**
 * Executes the callback at least 10s after this method runs. And never before high priority work, like user
 * interactions, scroll events and so forth.
 *
 * @see https://github.com/facebook/react/blob/2655c9354d8e1c54ba888444220f63e836925caa/packages/scheduler/src/forks/Scheduler.js#L83
 *
 * @example
 *
 * ```ts
 * function performGarbageCollection() { }
 *
 * // Non IO blocking work
 * scheduleLowPriority(performGarbageCollection);
 * ```
 */
export function scheduleLowPriority(callback: () => void) {
  return unstable_scheduleCallback(unstable_LowPriority, callback)
}
