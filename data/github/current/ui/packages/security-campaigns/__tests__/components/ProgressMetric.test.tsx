import {screen} from '@testing-library/react'
import {ProgressMetric, type ProgressMetricProps} from '../../components/ProgressMetric'
import {render as reactRender} from '@github-ui/react-core/test-utils'

const defaultProps: ProgressMetricProps = {
  openCount: 2,
  closedCount: 0,
  isSuccess: true,
  endsAt: new Date('2023-01-20T00:00:00Z'),
  createdAt: new Date('2023-01-01T00:00:00Z'),
}
const fakedSystemDate = new Date('2023-01-10T00:00:00Z')

const render = (props?: Partial<ProgressMetricProps>) => reactRender(<ProgressMetric {...defaultProps} {...props} />)

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(fakedSystemDate)
})

test('Renders progress information when progress is 0%', () => {
  render()

  expect(screen.getByText('0% (0 alerts)')).toBeInTheDocument()
  expect(screen.getByText('2 alerts left')).toBeInTheDocument()
})

test('Renders progress information when campaign is partially complete', () => {
  render({openCount: 3, closedCount: 2})

  expect(screen.getByText('40% (2 alerts)')).toBeInTheDocument()
  expect(screen.getByText('3 alerts left')).toBeInTheDocument()
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40')
})

test('Renders progress information when progress is 100%', () => {
  render({openCount: 0, closedCount: 2})

  expect(screen.getByText('100% (2 alerts)')).toBeInTheDocument()
  expect(screen.getByText('0 alerts left')).toBeInTheDocument()
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
})

test('Renders progress information when campaign has zero alerts', () => {
  render({openCount: 0, closedCount: 0})

  expect(screen.getByText('0% (0 alerts)')).toBeInTheDocument()
  expect(screen.getByText('0 alerts left')).toBeInTheDocument()
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
})

test('Renders progress information with singular terms when 1 alert completed / remaining', () => {
  render({openCount: 1, closedCount: 1})

  expect(screen.getByText('50% (1 alert)')).toBeInTheDocument()
  expect(screen.getByText('1 alert left')).toBeInTheDocument()
})

test('Renders remaining days when campaign started some days ago', () => {
  const createdAt = new Date('2023-01-08T00:00:00Z')

  render({createdAt})
  expect(screen.getByText('Campaign started 2 days ago')).toBeInTheDocument()
})

test('Renders campaign started today text when campaign started today', () => {
  render({createdAt: fakedSystemDate})

  expect(screen.getByText('Campaign started today')).toBeInTheDocument()
})

test('Renders campaign has been completed text when campaign is 100% complete', () => {
  render({openCount: 0, closedCount: 2})

  expect(screen.getByText('Campaign has been completed')).toBeInTheDocument()
})

test('Renders remaining days when campaign is overdue', () => {
  const endsAt = new Date('2023-01-03T00:00:00Z')

  render({endsAt})

  expect(screen.getByText('Campaign overdue by 7 days')).toBeInTheDocument()
})

test('Renders remaining day when campaign is 1 second to be overdue', () => {
  const endsAt = new Date('2023-01-09T23:59:59Z')

  render({endsAt})

  expect(screen.getByText('Campaign overdue by 1 day')).toBeInTheDocument()
})

test('Renders remaining day when campaign is overdue by 1 day', () => {
  const endsAt = new Date('2023-01-09T00:00:00Z')

  render({endsAt})

  expect(screen.getByText('Campaign overdue by 1 day')).toBeInTheDocument()
})

test('Renders remaining day when campaign is overdue by less than a day', () => {
  const endsAt = new Date('2023-01-09T00:00:01Z')

  render({endsAt})

  expect(screen.getByText('Campaign overdue by 1 day')).toBeInTheDocument()
})

test('Renders Campaign completed text even when campaign is overdue', () => {
  const endsAt = new Date('2023-01-03T00:00:00Z')

  render({endsAt, openCount: 0, closedCount: 2})

  expect(screen.getByText('Campaign has been completed')).toBeInTheDocument()
})
