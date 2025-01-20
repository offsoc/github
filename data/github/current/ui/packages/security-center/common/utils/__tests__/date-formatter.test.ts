import {humanReadableDate, toUTCDateString} from '../date-formatter'

describe('humanReadableDate', () => {
  it('includes the year if includeYear is true', async () => {
    expect(humanReadableDate(new Date('2024-01-01T00:00:00.000Z'), {includeYear: true})).toBe('Jan 1, 2024')
    expect(humanReadableDate(new Date('2023-12-31T00:00:00.000Z'), {includeYear: true})).toBe('Dec 31, 2023')
  })

  it('excludes the year if includeYear is false', async () => {
    expect(humanReadableDate(new Date('2024-01-01T00:00:00.000Z'), {includeYear: false})).toBe('Jan 1')
    expect(humanReadableDate(new Date('2023-12-31T00:00:00.000Z'), {includeYear: false})).toBe('Dec 31')
  })

  it('includes the year if includeYear is omitted and the UTC year is not the current UTC year', async () => {
    const pastYear = new Date().getUTCFullYear() - 1
    expect(humanReadableDate(new Date(`${pastYear}-12-31T00:00:00.000Z`))).toBe(`Dec 31, ${pastYear}`)
  })

  it('excludes the year if includeYear is omitted and the UTC year is the current UTC year', async () => {
    const currentYear = new Date().getUTCFullYear()
    expect(humanReadableDate(new Date(`${currentYear}-12-31T00:00:00.000Z`))).toBe('Dec 31')
  })
})

describe('toUTCDateString', () => {
  it('returns a string in the format YYYY-MM-DD', async () => {
    expect(toUTCDateString(new Date('2024-01-01T00:00:00.000Z'))).toBe('2024-01-01')
    expect(toUTCDateString(new Date('2023-12-31T00:00:00.000Z'))).toBe('2023-12-31')
  })

  it('formats using the UTC date', async () => {
    expect(toUTCDateString(new Date('2023-12-31T17:00:00.000-0700'))).toBe('2024-01-01')
  })
})
