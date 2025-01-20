import {render, screen} from '@testing-library/react'
import {PulseCheck} from '../PulseCheck'
import type {CopilotForBusinessTrial} from '../../../types'

const generateSeatBreakdown = (seats_billed: number, seats_pending: number) => {
  return {
    seats_assigned: 0,
    seats_billed,
    seats_pending,
    description: 'Seats',
  }
}

describe('PulseCheck', () => {
  test('should render fallback text when no data is provided', () => {
    render(<PulseCheck slug="cool-org" planText="Business" seatBreakdown={generateSeatBreakdown(0, 0)} />)

    const costPulseEl = screen.getByTestId('cost-pulse-text')
    const licensePulseEl = screen.getByTestId('license-pulse-text')

    expect(costPulseEl.textContent).toBe('No data yet')
    expect(licensePulseEl.textContent).toBe('No data yet')
  })

  test('should render estimated cost and license count when data is provided', () => {
    render(<PulseCheck slug="cool-org" planText="Business" seatBreakdown={generateSeatBreakdown(1, 0)} />)

    const costPulseEl = screen.getByTestId('cost-pulse-text')
    const licensePulseEl = screen.getByTestId('license-pulse-text')
    const perSeatPulseEl = screen.getByTestId('per-seat-pulse-text')

    expect(costPulseEl.textContent).toBe('$19.00')
    expect(licensePulseEl.textContent).toBe('1 seat')
    expect(perSeatPulseEl.textContent).toContain('Each purchased seat is $19 USD/month.')
  })

  test('should render estimated cost and license count for Enterprise when data is provided', () => {
    render(<PulseCheck slug="cool-org" planText="Enterprise" seatBreakdown={generateSeatBreakdown(1, 0)} />)

    const costPulseEl = screen.getByTestId('cost-pulse-text')
    const licensePulseEl = screen.getByTestId('license-pulse-text')
    const perSeatPulseEl = screen.getByTestId('per-seat-pulse-text')

    expect(costPulseEl.textContent).toBe('$39.00')
    expect(licensePulseEl.textContent).toBe('1 seat')
    expect(perSeatPulseEl.textContent).toContain('Each purchased seat is $39 USD/month.')
  })

  test('should render trial information when pending trial data is provided', () => {
    const trial = {has_trial: true, active: false, copilot_plan: 'business'} as CopilotForBusinessTrial
    render(<PulseCheck slug="cool-org" trial={trial} planText="Business" seatBreakdown={generateSeatBreakdown(1, 0)} />)

    const costPulseEl = screen.getByTestId('cost-pulse-text')
    const licensePulseEl = screen.getByTestId('license-pulse-text')
    const perSeatPulseEl = screen.getByTestId('per-seat-pulse-text')

    expect(costPulseEl.textContent).toBe('Free')
    expect(licensePulseEl.textContent).toBe('1 seat')
    expect(perSeatPulseEl.textContent).not.toBe('Free until')
  })

  test('should render Copilot Business trial information when active trial data is provided', () => {
    const trial = {
      has_trial: true,
      active: true,
      ends_at: String(new Date()),
      copilot_plan: 'business',
    } as CopilotForBusinessTrial
    render(<PulseCheck slug="cool-org" trial={trial} planText="Business" seatBreakdown={generateSeatBreakdown(1, 0)} />)

    const costPulseEl = screen.getByTestId('cost-pulse-text')
    const licensePulseEl = screen.getByTestId('license-pulse-text')
    const perSeatPulseEl = screen.getByTestId('per-seat-pulse-text')

    expect(costPulseEl.textContent).toBe('Free')
    expect(licensePulseEl.textContent).toBe('1 seat')
    expect(perSeatPulseEl.textContent).toContain('Free Copilot Business trial until')
  })

  test('should render Copilot Enterprise trial information when active trial data is provided', () => {
    const trial = {
      has_trial: true,
      active: true,
      ends_at: String(new Date()),
      copilot_plan: 'enterprise',
    } as CopilotForBusinessTrial
    render(<PulseCheck slug="cool-org" trial={trial} planText="Business" seatBreakdown={generateSeatBreakdown(1, 0)} />)

    const costPulseEl = screen.getByTestId('cost-pulse-text')
    const licensePulseEl = screen.getByTestId('license-pulse-text')
    const perSeatPulseEl = screen.getByTestId('per-seat-pulse-text')

    expect(costPulseEl.textContent).toBe('$19.00')
    expect(licensePulseEl.textContent).toBe('1 seat')
    expect(perSeatPulseEl.textContent).toContain('Free Copilot Enterprise trial until')
  })

  test('should render multiple licenses correctly', () => {
    render(<PulseCheck slug="cool-org" planText="Business" seatBreakdown={generateSeatBreakdown(5, 0)} />)

    const costPulseEl = screen.getByTestId('cost-pulse-text')
    const licensePulseEl = screen.getByTestId('license-pulse-text')

    expect(costPulseEl.textContent).toBe('$95.00')
    expect(licensePulseEl.textContent).toBe('5 seats')
  })

  test('should render cost for pending licenses correctly', () => {
    render(<PulseCheck slug="cool-org" planText="Business" seatBreakdown={generateSeatBreakdown(1, 1)} />)

    const costPulseEl = screen.getByTestId('cost-pulse-text')
    const licensePulseEl = screen.getByTestId('license-pulse-text')

    expect(costPulseEl.textContent).toBe('$38.00')
    expect(licensePulseEl.textContent).toBe('2 seats')
  })
})
