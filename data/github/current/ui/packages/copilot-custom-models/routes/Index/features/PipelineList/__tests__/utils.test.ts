import {prettifyDuration} from '../utils'

describe('prettifyDuration', () => {
  it('formats 100+ day durations correctly', () => {
    const startDate = new Date('2023-01-18T08:00:00').getTime()
    const endDate = new Date('2024-01-19T10:45:00').getTime()
    expect(prettifyDuration(startDate, endDate)).toBe('366d 02h 45m')
  })

  it('formats <10 day durations correctly', () => {
    const startDate = new Date('2024-01-18T08:00:00').getTime()
    const endDate = new Date('2024-01-19T10:45:00').getTime()
    expect(prettifyDuration(startDate, endDate)).toBe('01d 02h 45m')
  })

  it('formats 0 hour durations correctly', () => {
    const startDate = new Date('2024-01-18T08:00:00').getTime()
    const endDate = new Date('2024-01-19T08:45:00').getTime()
    expect(prettifyDuration(startDate, endDate)).toBe('01d 00h 45m')
  })

  it('formats <1 day durations correctly', () => {
    const startDate = new Date('2024-01-18T08:00:00').getTime()
    const endDate = new Date('2024-01-18T10:45:00').getTime()
    expect(prettifyDuration(startDate, endDate)).toBe('02h 45m')
  })

  it('formats <1 hour durations correctly', () => {
    const startDate = new Date('2024-01-18T08:00:00').getTime()
    const endDate = new Date('2024-01-18T08:45:00').getTime()
    expect(prettifyDuration(startDate, endDate)).toBe('45m')
  })

  it('formats 0 minute durations correctly', () => {
    const startDate = new Date('2024-01-18T08:00:00').getTime()
    const endDate = new Date('2024-01-18T08:00:00').getTime()
    expect(prettifyDuration(startDate, endDate)).toBe('00m')
  })
})
