import {DatePicker} from '@github-ui/date-picker'
import {FormControl} from '@primer/react'

import type {IterationDuration} from '../../../helpers/iterations'
import {Resources} from '../../../strings'
import {IterationDurationInput} from './iteration-duration-input'
import styles from './new-iteration-options.module.css'

interface NewIterationOptionsProps {
  /** Selected duration. */
  duration: IterationDuration
  /** Called when duration changed. */
  onDurationChange: (duration: IterationDuration) => void
  /** Selected start date. */
  startDate: Date
  /** Called on start date change. Start date cannot be cleared so it's always defined. */
  onStartDateChange: (startDate: Date) => void
  /** Minimum allowed start date. The start date can equal this but not be before it. */
  minStartDate?: Date
  /**
   * Called when the input validity changes. If this was most recently called with `false`,
   * the parent component should not allow creating an iteration (ie, the submit button
   * should be disabled).
   */
  onValidChange?: (isValid: boolean) => void
}

/**
 * Stateless user input for the options required to create a new iteration field / instance.
 */
export function NewIterationOptions({
  duration,
  onDurationChange,
  startDate,
  onStartDateChange,
  minStartDate,
  onValidChange,
}: NewIterationOptionsProps) {
  const onDatePickerChange = (date?: Date | null) => {
    // This should not be possible since the date cannot be cleared
    if (!date) throw new Error('Start date cannot be null/undefined.')
    onStartDateChange(date)
  }

  return (
    <>
      <FormControl id="iteration-start-date" sx={{mb: 2}}>
        <FormControl.Label>{Resources.iterationStartDateLabel}</FormControl.Label>

        <DatePicker
          aria-label={Resources.iterationStartDateLabel}
          variant="single"
          value={startDate}
          onChange={onDatePickerChange}
          minDate={minStartDate}
          showTodayButton={false}
          anchorClassName={styles.datePicker}
        />
      </FormControl>

      <FormControl id="duration-quantity-input" sx={{alignItems: 'initial'}}>
        <FormControl.Label>{Resources.iterationDurationLabel}</FormControl.Label>
        <IterationDurationInput value={duration} onChange={onDurationChange} onValidChange={onValidChange} />
      </FormControl>
    </>
  )
}
