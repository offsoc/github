import {calculateDaysLeft} from '../calculate-days-left'

describe('calculateDaysLeft', () => {
  const currentDate = new Date('2022-01-01T00:00:00Z')

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(currentDate)
  })

  it('Returns the correct number of days left for a future date', () => {
    const futureDate = new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days in the future
    expect(calculateDaysLeft(futureDate)).toBe(5)
  })

  it('Returns the correct number of days left for a past date', () => {
    const pastDate = new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days in the past
    expect(calculateDaysLeft(pastDate)).toBe(-3)
  })

  it('Returns 0 days left for the current date', () => {
    expect(calculateDaysLeft(currentDate)).toBe(0)
  })
})
