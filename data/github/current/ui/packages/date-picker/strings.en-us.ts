import {format} from 'date-fns/format'

export const DateResources = {
  invalidConfiguration: 'Invalid configuration',
  invalidDate: 'Invalid date',
  invalidSelection: 'Invalid selection',
  weekend: 'Must not fall on a weekend',
  beforeMinDate: (minDate: Date) => `Must be on or after ${format(minDate, 'PP')}`,
  afterMaxDate: (maxDate: Date) => `Must be on or before ${format(maxDate, 'PP')}`,
  shortcutInputDescription: 'Use arrow keys to select a date, or type a date like "Dec 28, 2020" or "12/28/2020".',
  dateInputDescription: 'Type a date, like "Dec 28, 2020" or "12/28/2020".',
  monthSingleDescription: 'Select a date from the grid.',
  monthMultiDescription: (isMac: boolean) =>
    `Select dates from the grid. Use ${
      isMac ? 'command' : 'control'
    } + enter to select multiple, and shift + enter to select ranges.`,
  monthRangeDescription: {
    from: 'Select a start date from the grid.',
    to: 'Select an end date from the grid.',
  },
} as const
