import {calculatePreviousDateRange} from '../date-period'

describe('CalculatePreviousDateRange', () => {
  it('returns the correct date range', async () => {
    const {startDate, endDate} = calculatePreviousDateRange('2024-01-01', '2024-01-10')

    expect(startDate).toBe('2023-12-22')
    expect(endDate).toBe('2023-12-31')
  })
})
