import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {Day, type DayProps} from '../components/Day'
import {DatePickerProvider} from '../components/Provider'

describe('Day', () => {
  const setDate = '2023-12-04T12:00:00Z'

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date(setDate))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('renders Day', () => {
    renderDay({date: new Date()})

    expect(screen.getByTestId('day-12/04/2023')).toBeInTheDocument()
  })
})

const renderDay = ({...args}: DayProps) => {
  const ref = jest.fn()
  return render(
    <DatePickerProvider variant="single" value={args.date} forwardedAnchorRef={ref}>
      <Day {...args} />
    </DatePickerProvider>,
  )
}
