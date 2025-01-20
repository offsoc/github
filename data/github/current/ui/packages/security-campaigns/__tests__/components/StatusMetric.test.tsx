import {screen} from '@testing-library/react'
import {render as reactRender} from '@github-ui/react-core/test-utils'
import {StatusMetric, type StatusMetricProps} from '../../components/StatusMetric'

const defaultProps: StatusMetricProps = {
  endsAt: new Date('2023-01-20T00:00:00Z'),
  isCompleted: false,
}
const render = (props?: Partial<StatusMetricProps>) => reactRender(<StatusMetric {...defaultProps} {...props} />)

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date('2023-01-10T00:00:00Z'))
})

test('Renders days left when value is positive', () => {
  render()

  expect(screen.getByText('10')).toBeInTheDocument()
  expect(screen.getByText('days left')).toBeInTheDocument()
})

test('Renders day left with singular terms when value is 1 day', () => {
  render({endsAt: new Date('2023-01-11T00:00:00Z')})

  expect(screen.getByText('1')).toBeInTheDocument()
  expect(screen.getByText('day left')).toBeInTheDocument()
})

test('Renders days left when value is between 0 and 1 days', () => {
  render({endsAt: new Date('2023-01-10T12:00:00Z')})

  expect(screen.getByText('0')).toBeInTheDocument()
  expect(screen.getByText('days left')).toBeInTheDocument()
})

test('Renders overdue when value is campaign is overdue', () => {
  render({endsAt: new Date('2023-01-09T00:00:00Z')})

  expect(screen.getByText('Overdue')).toBeInTheDocument()
})

test('Renders completed when campaign is completed', () => {
  render({isCompleted: true})

  expect(screen.getByText('Completed')).toBeInTheDocument()
})
