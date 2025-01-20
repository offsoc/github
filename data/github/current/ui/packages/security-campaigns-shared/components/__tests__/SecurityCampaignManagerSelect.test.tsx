import {screen} from '@testing-library/react'
import {render as reactRender} from '@github-ui/react-core/test-utils'
import {mockFetch} from '@github-ui/mock-fetch'
import {queryClient} from '../../test-utils/query-client'
import {SecurityCampaignManagerSelect, type SecurityCampaignManagerSelectProps} from '../SecurityCampaignManagerSelect'
import {getUser} from '../../test-utils/mock-data'
import type {SecurityManagersResult} from '../../hooks/use-campaign-managers-query'
import type {User} from '../../types/user'
import {TestWrapper} from '../../test-utils/TestWrapper'

const campaignManagersPath = '/github/security-campaigns/security/campaigns/managers'

const manager = getUser({
  id: 3,
  login: 'octocat',
})

const managers: User[] = [
  getUser(),
  manager,
  getUser({
    id: 4,
    login: 'hubot',
  }),
]

const render = (props?: Partial<SecurityCampaignManagerSelectProps>) =>
  reactRender(
    <SecurityCampaignManagerSelect
      value={getUser()}
      onChange={jest.fn()}
      campaignManagersPath={campaignManagersPath}
      {...props}
    />,
    {wrapper: TestWrapper},
  )

beforeEach(() => {
  queryClient.clear()

  mockFetch.mockRoute(campaignManagersPath, {managers} satisfies SecurityManagersResult, {
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  })

  // Mock the scrollTo method to prevent errors in the tests
  Object.defineProperty(window.Element.prototype, 'scrollTo', {
    value: jest.fn(),
    writable: true,
  })
})

test('the field shows placeholder text when no value is given', () => {
  render({
    value: null,
  })

  expect(screen.getByRole('button')).toHaveTextContent('Select manager')
})

test('the field shows the user login when a value is given', () => {
  render({
    value: manager,
  })

  expect(screen.getByRole('button')).toHaveTextContent(manager.login)
})

test('the field shows the user avatar when a value is given', () => {
  render({
    value: manager,
  })

  expect(screen.getByRole<HTMLImageElement>('img').src).toEqual(manager.avatarUrl)
})

test('the field allows selecting a different user', async () => {
  const onChange = jest.fn()

  const {user} = render({
    onChange,
  })

  await user.click(screen.getByRole('button'))

  await user.click(
    screen.getByRole('option', {
      name: manager.login,
    }),
  )

  expect(onChange).toHaveBeenCalledTimes(1)
  expect(onChange).toHaveBeenCalledWith(manager)
})

test('the field clears by selecting the currently selected user', async () => {
  const onChange = jest.fn()

  const {user} = render({
    value: manager,
    onChange,
  })

  await user.click(screen.getByRole('button'))

  await user.click(
    screen.getByRole('option', {
      name: manager.login,
    }),
  )

  expect(onChange).toHaveBeenCalledTimes(1)
  expect(onChange).toHaveBeenCalledWith(null)
})

test('the field allows filtering by login', async () => {
  const {user} = render()

  await user.click(screen.getByRole('button'))

  expect(screen.queryAllByRole('option').length).toEqual(3)

  await user.type(screen.getByRole('textbox'), 'hu')

  expect(screen.queryAllByRole('option').length).toEqual(1)
  expect(screen.getByRole('option', {name: 'hubot'})).toBeInTheDocument()
})

test("the field shows the current value even if it's not in the response", async () => {
  const value = getUser({
    id: 5,
    login: 'not-in-response',
  })

  const {user} = render({
    value,
  })

  await user.click(screen.getByRole('button'))

  expect(screen.queryAllByRole('option').length).toEqual(4)
  expect(
    screen
      .queryAllByRole('option')
      .map(option => option.textContent)
      .sort(),
  ).toEqual(['hubot', 'monalisa', 'not-in-response', 'octocat'])
})
