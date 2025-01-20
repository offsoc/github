import type {RangeSelection} from '@github-ui/date-picker'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen, within} from '@testing-library/react'

import type {Period} from '../../../utils/date-period'
import {DateSpanPicker, isPeriodSelection, isRangeSelection, toDateSpan} from '../DateSpanPicker'

jest.useFakeTimers()
const currTime = new Date('2024-01-10T00:00:00Z')
jest.setSystemTime(currTime)

describe('DateSpanPicker', () => {
  const maxDate = new Date('2022-01-10')
  const minDate = new Date('2021-01-01')
  const onChange = jest.fn()
  const selectedValue = {period: 'last14days'} as Period

  it('renders the component when the selectedValue is a Period', () => {
    render(<DateSpanPicker maxDate={maxDate} minDate={minDate} onChange={onChange} selectedValue={selectedValue} />)

    expect(screen.getByTestId('date-span-picker-calendar-icon')).toBeInTheDocument()
    expect(within(screen.getByTestId('date-span-picker-button')).getByText('Last 14 days')).toBeInTheDocument()
  })

  it('renders the component when the selectedValue is a date range', () => {
    render(
      <DateSpanPicker
        maxDate={maxDate}
        minDate={minDate}
        onChange={onChange}
        selectedValue={{from: new Date('2024-01-01'), to: new Date('2024-01-10')} as RangeSelection}
      />,
    )

    expect(screen.getByTestId('date-span-picker-calendar-icon')).toBeInTheDocument()
    expect(within(screen.getByTestId('date-span-picker-button')).getByText('Jan 1 - Jan 10')).toBeInTheDocument()
  })

  it('includes year if the date range is in a different year', () => {
    render(
      <DateSpanPicker
        maxDate={maxDate}
        minDate={minDate}
        onChange={onChange}
        selectedValue={{from: new Date('2023-01-01'), to: new Date('2024-01-10')} as RangeSelection}
      />,
    )

    expect(within(screen.getByTestId('date-span-picker-button')).getByText('Jan 1, 2023 - Jan 10')).toBeInTheDocument()
  })

  it('checks the selected value in the dropdown', async () => {
    render(<DateSpanPicker maxDate={maxDate} minDate={minDate} onChange={onChange} selectedValue={selectedValue} />)

    openDropdown()

    const dropdownItems = within(screen.getByRole('menu')).getAllByRole('menuitemradio')
    expect(dropdownItems).toHaveLength(4)

    const last14 = dropdownItems[0]
    expect(last14).toHaveTextContent('Last 14 days')
    expect(last14).toHaveAttribute('aria-checked', 'true')

    const last30 = dropdownItems[1]
    expect(last30).toHaveTextContent('Last 30 days')
    expect(last30).toHaveAttribute('aria-checked', 'false')

    const last90 = dropdownItems[2]
    expect(last90).toHaveTextContent('Last 90 days')
    expect(last90).toHaveAttribute('aria-checked', 'false')

    const rangePicker = dropdownItems[3]
    expect(rangePicker).toHaveTextContent('Date range...')
    expect(rangePicker).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange when selecting a date period', () => {
    render(<DateSpanPicker maxDate={maxDate} minDate={minDate} onChange={onChange} selectedValue={selectedValue} />)

    openDropdown()

    const dropdownItems = within(screen.getByRole('menu')).getAllByRole('menuitemradio')

    const last90 = dropdownItems[2]
    expect(last90).toBeInTheDocument()
    expect(last90).toHaveTextContent('Last 90 days')

    act(() => last90?.click())
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('calls onChange when selecting a date range', () => {
    render(<DateSpanPicker maxDate={maxDate} minDate={minDate} onChange={onChange} selectedValue={selectedValue} />)

    openDropdown()

    const dropdownItems = within(screen.getByRole('menu')).getAllByRole('menuitemradio')

    const dateRange = dropdownItems[3]
    expect(dateRange).toBeInTheDocument()
    expect(dateRange).toHaveTextContent('Date range...')

    act(() => dateRange?.click())

    const dateOptions = screen.getAllByRole('gridcell')
    expect(dateOptions).toHaveLength(42)

    act(() => {
      dateOptions[0]?.click()
      dateOptions[10]?.click()
    })

    expect(onChange).toHaveBeenCalledTimes(1)
  })

  describe('isPeriodSelection', () => {
    it('returns true for date period object', () => {
      const value: Period = {period: 'last30days'}
      const result = isPeriodSelection(value)
      expect(result).toEqual(true)
    })

    it('returns false for date range object', () => {
      const value: RangeSelection = {from: new Date('2024-01-01'), to: new Date('2024-12-31')}
      const result = isPeriodSelection(value)
      expect(result).toEqual(false)
    })

    it('returns false for empty object', () => {
      const value = {}
      const result = isPeriodSelection(value)
      expect(result).toEqual(false)
    })
  })

  describe('isRangeSelection', () => {
    it('returns false for date period object', () => {
      const value: Period = {period: 'last30days'}
      const result = isRangeSelection(value)
      expect(result).toEqual(false)
    })

    it('returns true for date range object', () => {
      const value: RangeSelection = {from: new Date('2024-01-01'), to: new Date('2024-12-31')}
      const result = isRangeSelection(value)
      expect(result).toEqual(true)
    })

    it('returns false for empty object', () => {
      const value = {}
      const result = isRangeSelection(value)
      expect(result).toEqual(false)
    })
  })

  describe('toDateSpan', () => {
    it('returns date period object as-is', () => {
      const value: Period = {period: 'last30days'}
      const result = toDateSpan(value)
      expect(isPeriodSelection(result)).toEqual(true)
      expect(result).toBe(value)
    })

    it('converts string range to date range object', () => {
      const value = {from: '2024-01-01', to: '2024-12-31'}
      const result = toDateSpan(value)
      expect(isRangeSelection(result)).toEqual(true)
      expect((result as RangeSelection).from).toEqual(new Date('2024-01-01'))
      expect((result as RangeSelection).to).toEqual(new Date('2024-12-31'))
    })
  })
})

function openDropdown(): void {
  const button = screen.getByTestId('date-span-picker-button') //getByRole('button')
  expect(button).toBeInTheDocument()

  act(() => button.click())
}
