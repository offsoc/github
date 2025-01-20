import {screen} from '@testing-library/react'
import {render, RouteContext} from '@github-ui/react-core/test-utils'
import {FilterOption} from '../../components/FilterOption'

beforeAll(() => {
  performance.clearResourceTimings = jest.fn()
  performance.mark = jest.fn()
})

test('Renders a FilterOption Button and action items', async () => {
  const {user} = render(
    <FilterOption
      name="Type"
      group={{
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
      }}
    />,
  )
  const button = screen.getByRole('button', {name: 'Type: All'})
  expect(button).toBeInTheDocument()

  await user.click(button)

  const all = await screen.findByRole('menuitemcheckbox', {name: 'All'})
  expect(all).toBeInTheDocument()

  const apps = await screen.findByRole('menuitemcheckbox', {name: 'Apps'})
  expect(apps).toBeInTheDocument()

  const users = await screen.findByRole('menuitemcheckbox', {name: 'Users'})
  expect(users).toBeInTheDocument()

  expect(users.getAttribute('aria-disabled')).toBe('true')
  expect(all.getAttribute('aria-checked')).toBe('true')
})

test('Clicking on an option navigates', async () => {
  const {user} = render(
    <FilterOption
      name="Type"
      group={{
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
      }}
    />,
  )
  const button = screen.getByRole('button', {name: 'Type: All'})
  expect(button).toBeInTheDocument()

  await user.click(button)

  const apps = await screen.findByRole('menuitemcheckbox', {name: 'Apps'})
  const all = await screen.findByRole('menuitemcheckbox', {name: 'All'})
  expect(apps).toBeInTheDocument()
  expect(all).toBeInTheDocument()

  expect(RouteContext.location?.pathname).toEqual('/')
  expect(RouteContext.location?.search).toEqual('')
  expect(all.getAttribute('aria-checked')).toBe('true')

  await user.click(apps)

  expect(RouteContext.location?.pathname).toEqual('/')
  expect(RouteContext.location?.search).toEqual('?type=apps')
})

test('Sets correct state on rerender', async () => {
  const {rerender, user} = render(
    <FilterOption
      name="Type"
      group={{
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
      }}
    />,
  )
  const button = screen.getByRole('button', {name: 'Type: All'})
  expect(button).toBeInTheDocument()

  await user.click(button)

  const all = await screen.findByRole('menuitemcheckbox', {name: 'All'})
  expect(all).toBeInTheDocument()

  const apps = await screen.findByRole('menuitemcheckbox', {name: 'Apps'})
  expect(apps).toBeInTheDocument()

  const users = await screen.findByRole('menuitemcheckbox', {name: 'Users'})
  expect(users).toBeInTheDocument()

  expect(users.getAttribute('aria-disabled')).toBe('true')
  expect(all.getAttribute('aria-checked')).toBe('true')

  rerender(
    <FilterOption
      name="Type"
      group={{
        selected_value: 'apps',
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
      }}
    />,
  )

  const buttonRerender = screen.getByRole('button', {name: 'Type: Apps'})
  expect(buttonRerender).toBeInTheDocument()
})
