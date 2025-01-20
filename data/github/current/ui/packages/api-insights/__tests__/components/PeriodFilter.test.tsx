import {screen} from '@testing-library/react'
import {render, RouteContext} from '@github-ui/react-core/test-utils'
import {PeriodFilter} from '../../components/PeriodFilter'

beforeAll(() => {
  performance.clearResourceTimings = jest.fn()
  performance.mark = jest.fn()
})

test('Renders a Button and action items', async () => {
  const {user} = render(
    <PeriodFilter
      name="Period"
      groups={[
        {
          selected_value: '24h',
          query_param: 'period',
          options: [
            {
              name: 'Last hour',
              value: '1h',
            },
            {
              name: 'Last 24 hours',
              value: '24h',
            },
            {
              name: 'Last 28 days',
              value: '28d',
              disabled: true,
            },
          ],
        },
      ]}
    />,
  )
  const button = screen.getByRole('button', {name: 'Period: Last 24 hours'})
  expect(button).toBeInTheDocument()

  await user.click(button)

  const hour = await screen.findByRole('menuitemcheckbox', {name: 'Last hour'})
  expect(hour).toBeInTheDocument()

  const day = await screen.findByRole('menuitemcheckbox', {name: 'Last 24 hours'})
  expect(day).toBeInTheDocument()

  const month = await screen.findByRole('menuitemcheckbox', {name: 'Last 28 days'})
  expect(month).toBeInTheDocument()

  expect(month.getAttribute('aria-disabled')).toBe('true')
  expect(day.getAttribute('aria-checked')).toBe('true')
})

test('With a single group, clicking on an option navigates', async () => {
  const {user} = render(
    <PeriodFilter
      name="Period"
      groups={[
        {
          selected_value: '24h',
          query_param: 'period',
          options: [
            {
              name: 'Last hour',
              value: '1h',
            },
            {
              name: 'Last 24 hours',
              value: '24h',
            },
            {
              name: 'Last 28 days',
              value: '28d',
              disabled: true,
            },
          ],
        },
      ]}
    />,
  )
  const button = screen.getByRole('button', {name: 'Period: Last 24 hours'})
  expect(button).toBeInTheDocument()

  await user.click(button)

  const day = await screen.findByRole('menuitemcheckbox', {name: 'Last 24 hours'})
  const hour = await screen.findByRole('menuitemcheckbox', {name: 'Last hour'})
  expect(day).toBeInTheDocument()
  expect(hour).toBeInTheDocument()

  expect(RouteContext.location?.pathname).toEqual('/')
  expect(RouteContext.location?.search).toEqual('')
  expect(day.getAttribute('aria-checked')).toBe('true')

  await user.click(hour)

  expect(RouteContext.location?.pathname).toEqual('/')
  expect(RouteContext.location?.search).toEqual('?period=1h')
})

test('Supports multiple groups', async () => {
  const {user} = render(
    <PeriodFilter
      name="Period"
      groups={[
        {
          name: 'Period',
          selected_value: '24h',
          query_param: 'period',
          options: [
            {
              name: 'Last hour',
              value: '1h',
            },
            {
              name: 'Last 24 hours',
              value: '24h',
            },
            {
              name: 'Last 28 days',
              value: '28d',
              disabled: true,
            },
          ],
        },
        {
          name: 'Time zone',
          selected_value: 'UTC',
          query_param: 't',
          options: [
            {
              name: 'UTC',
              value: 'UTC',
            },
            {
              name: 'Local',
              value: 'local',
            },
          ],
        },
      ]}
    />,
  )
  const button = screen.getByRole('button', {name: 'Period: Last 24 hours'})
  expect(button).toBeInTheDocument()

  await user.click(button)

  const period = await screen.findByText('Period')
  expect(period).toBeInTheDocument()

  const timeZone = await screen.findByText('Time zone')
  expect(timeZone).toBeInTheDocument()

  const hour = await screen.findByRole('menuitemcheckbox', {name: 'Last hour'})
  expect(hour).toBeInTheDocument()

  const day = await screen.findByRole('menuitemcheckbox', {name: 'Last 24 hours'})
  expect(day).toBeInTheDocument()

  const month = await screen.findByRole('menuitemcheckbox', {name: 'Last 28 days'})
  expect(month).toBeInTheDocument()

  expect(month.getAttribute('aria-disabled')).toBe('true')
  expect(day.getAttribute('aria-checked')).toBe('true')

  const UTC = await screen.findByRole('menuitemcheckbox', {name: 'UTC'})
  expect(UTC).toBeInTheDocument()

  const local = await screen.findByRole('menuitemcheckbox', {name: 'Local'})
  expect(local).toBeInTheDocument()

  expect(UTC.getAttribute('aria-checked')).toBe('true')
})

test('When given multiple groups can select one per group', async () => {
  const {user} = render(
    <PeriodFilter
      name="Type"
      groups={[
        {
          name: 'Type',
          selected_value: 'all',
          query_param: 'type',
          options: [
            {
              name: 'All',
              value: 'all',
            },
            {
              name: 'Apps',
              value: 'apps',
            },
            {
              name: 'Users',
              value: 'users',
              disabled: true,
            },
          ],
        },
        {
          name: 'Time zone',
          selected_value: 'UTC',
          query_param: 't',
          options: [
            {
              name: 'UTC',
              value: 'UTC',
            },
            {
              name: 'Local',
              value: 'local',
            },
          ],
        },
      ]}
    />,
  )
  const button = screen.getByRole('button', {name: 'Type: All'})
  expect(button).toBeInTheDocument()

  await user.click(button)

  const local = await screen.findByRole('menuitemcheckbox', {name: 'Local'})
  expect(local).toBeInTheDocument()

  expect(RouteContext.location?.pathname).toEqual('/')
  expect(RouteContext.location?.search).toEqual('')

  await user.click(local)

  expect(RouteContext.location?.pathname).toEqual('/')
  expect(RouteContext.location?.search).toEqual('?t=local')
})

test('Sets correct state on rerender', async () => {
  const {rerender, user} = render(
    <PeriodFilter
      name="Period"
      groups={[
        {
          selected_value: '24h',
          query_param: 'period',
          options: [
            {
              name: 'Last hour',
              value: '1h',
            },
            {
              name: 'Last 24 hours',
              value: '24h',
            },
            {
              name: 'Last 28 days',
              value: '28d',
              disabled: true,
            },
          ],
        },
      ]}
    />,
  )
  const button = screen.getByRole('button', {name: 'Period: Last 24 hours'})
  expect(button).toBeInTheDocument()

  await user.click(button)

  const hour = await screen.findByRole('menuitemcheckbox', {name: 'Last hour'})
  expect(hour).toBeInTheDocument()

  const day = await screen.findByRole('menuitemcheckbox', {name: 'Last 24 hours'})
  expect(day).toBeInTheDocument()

  const month = await screen.findByRole('menuitemcheckbox', {name: 'Last 28 days'})
  expect(month).toBeInTheDocument()

  expect(month.getAttribute('aria-disabled')).toBe('true')
  expect(day.getAttribute('aria-checked')).toBe('true')

  rerender(
    <PeriodFilter
      name="Period"
      groups={[
        {
          selected_value: '1h',
          query_param: 'period',
          options: [
            {
              name: 'Last hour',
              value: '1h',
            },
            {
              name: 'Last 24 hours',
              value: '24h',
            },
            {
              name: 'Last 28 days',
              value: '28d',
              disabled: true,
            },
          ],
        },
      ]}
    />,
  )

  const buttonRerender = screen.getByRole('button', {name: 'Period: Last hour'})
  expect(buttonRerender).toBeInTheDocument()
})
