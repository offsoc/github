import {useMemo} from 'react'

import {type DateSpan, DateSpanPicker} from '../date-span-picker'

type Props = {
  value: DateSpan
  watermarkDate?: Date
  onChange: (value: DateSpan) => void
}

function useDateSpanLimits(watermarkDate: Date | undefined): {minDate: Date; maxDate: Date} {
  const now = new Date()
  // destructuring this outside so that the memo only recalculates on date changes (not time)
  const nowYear = now.getUTCFullYear()
  const nowMonth = now.getUTCMonth()
  const nowDate = now.getUTCDate()

  return useMemo<{minDate: Date; maxDate: Date}>(() => {
    const maxDate = new Date(nowYear, nowMonth, nowDate)

    // Data retention limit is 2 years, so never let the user search older than that.
    let minDate = new Date(new Date(maxDate).setFullYear(maxDate.getFullYear() - 2))

    // A watermark date indicates the earliest date for when we have data.
    // If we're given a watermark date, and it is within the 2-year retention limit,
    // we should instead use that as the minimum, as there will not be data before.
    if (watermarkDate && watermarkDate > minDate) {
      minDate = watermarkDate
    }

    return {minDate, maxDate}
  }, [nowYear, nowMonth, nowDate, watermarkDate])
}

function DatePicker({value, watermarkDate, onChange}: Props): JSX.Element {
  const {minDate, maxDate} = useDateSpanLimits(watermarkDate)
  return <DateSpanPicker onChange={onChange} maxDate={maxDate} minDate={minDate} selectedValue={value} />
}

DatePicker.displayName = 'PageLayout.DatePicker'

// re-export DateSpanPicker types to simplify for consumers
export {type DateSpan, isPeriodSelection, isRangeSelection} from '../date-span-picker'

export default DatePicker
