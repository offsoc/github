import {formatUsageDateForPeriod, formatDate} from '../../utils/date'
import {UsagePeriod} from '../../enums'

const MOCK_DATE = '2023-03-14T16:21:25.316Z'

const MOCK_DATE_HOURLY_FORMAT = '4:21 PM'
const MOCK_DATE_DAILY_FORMAT = '4 PM'
const MOCK_DATE_MONTHLY_FORMAT = 'Mar 14, 2023'
const MOCK_DATE_YEARLY_FORMAT = 'Mar 2023'

describe('formatUsageDateForPeriod', () => {
  it('renders monthly date format when no period is supplied', () => {
    expect(formatUsageDateForPeriod(MOCK_DATE, undefined)).toBe(MOCK_DATE_MONTHLY_FORMAT)
  })

  it('renders hourly date format when UsagePeriod.THIS_HOUR is supplied', () => {
    expect(formatUsageDateForPeriod(MOCK_DATE, UsagePeriod.THIS_HOUR)).toBe(MOCK_DATE_HOURLY_FORMAT)
  })

  it('renders daily date format when UsagePeriod.TODAY is supplied', () => {
    expect(formatUsageDateForPeriod(MOCK_DATE, UsagePeriod.TODAY)).toBe(MOCK_DATE_DAILY_FORMAT)
  })

  it('renders monthly date format when UsagePeriod.THIS_MONTH is supplied', () => {
    expect(formatUsageDateForPeriod(MOCK_DATE, UsagePeriod.THIS_MONTH)).toBe(MOCK_DATE_MONTHLY_FORMAT)
  })

  it('renders yearly date format when UsagePeriod.THIS_YEAR is supplied', () => {
    expect(formatUsageDateForPeriod(MOCK_DATE, UsagePeriod.THIS_YEAR)).toBe(MOCK_DATE_YEARLY_FORMAT)
  })

  it('renders daily date format when UsagePeriod.LAST_MONTH is supplied', () => {
    expect(formatUsageDateForPeriod(MOCK_DATE, UsagePeriod.LAST_MONTH)).toBe(MOCK_DATE_MONTHLY_FORMAT)
  })

  it('renders daily date format when UsagePeriod.LAST_YEAR is supplied', () => {
    expect(formatUsageDateForPeriod(MOCK_DATE, UsagePeriod.LAST_YEAR)).toBe(MOCK_DATE_YEARLY_FORMAT)
  })
})

describe('formatDate', () => {
  it('renders the full date when year, month and date are present', () => {
    expect(formatDate(2023, 3, 14)).toBe('Mar 14, 2023')
  })

  it('renders the month and year when only year and month are present', () => {
    expect(formatDate(2023, 3)).toBe('Mar 2023')
  })
})
