import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {NotificationsSubscriptionsMenu} from '../NotificationsSubscriptionsMenu'
import {
  getNotificationsSubscriptionsMenuProps,
  getNotificationsSubscriptionsMenuWithLabelsProps,
} from '../test-utils/mock-data'
import {
  SUBSCRIPTION_TYPE_NAMES,
  SubscriptionTypeValue,
  subscriptionLabelText,
  subscriptionTypeText,
} from '../utils/subscriptions'

test.each(Object.values(SubscriptionTypeValue))('Renders the button for %s type', type => {
  const props = getNotificationsSubscriptionsMenuProps(type)
  render(<NotificationsSubscriptionsMenu {...props} />)

  const expectedLabel = subscriptionLabelText(type, 'reponame')
  expect(screen.getAllByLabelText(expectedLabel).length).toBe(2)

  const expectedButton = subscriptionTypeText(type)
  expect(screen.getByText(expectedButton)).toBeInTheDocument()
})

test('Renders the subscriptions menu when clicking the button', async () => {
  const props = getNotificationsSubscriptionsMenuProps(SubscriptionTypeValue.CUSTOM)
  const {user} = render(<NotificationsSubscriptionsMenu {...props} />)

  await user.click(screen.getByTestId('notifications-subscriptions-menu-button-desktop'))

  for (const value of Object.values(SUBSCRIPTION_TYPE_NAMES)) {
    expect(screen.getByText(value)).toBeVisible()
  }
})

test('Renders the custom dialog when clicking Custom option', async () => {
  const props = getNotificationsSubscriptionsMenuProps(SubscriptionTypeValue.CUSTOM)
  const {user} = render(<NotificationsSubscriptionsMenu {...props} />)

  await user.click(screen.getByTestId('notifications-subscriptions-menu-button-desktop'))
  await user.click(screen.getByText('Custom'))
  await user.click(screen.getByText('Issues'))
  await user.click(screen.getByText('Pull requests'))

  expect(screen.getByText('Subscribe to events for reponame')).toBeVisible()
  expect(screen.getAllByRole('checkbox', {name: 'Issues'})[0]).toBeVisible()
  expect(screen.getAllByRole('checkbox', {name: 'Pull requests'})[0]).toBeVisible()
  expect(screen.getByText('Discussions are not enabled for this repository')).toBeVisible()
  expect(screen.getByText('Apply')).toBeVisible()
  expect(screen.getByText('Cancel')).toBeVisible()
})

test('Renders the labels filter when the flag is enable in the Custom menu', async () => {
  const props = getNotificationsSubscriptionsMenuWithLabelsProps()
  const {user} = render(<NotificationsSubscriptionsMenu {...props} />)

  await user.click(screen.getByTestId('notifications-subscriptions-menu-button-desktop'))
  await user.click(screen.getByText('Custom'))

  expect(screen.getByText('Labels:')).toBeVisible()
  expect(screen.getByText('bug')).toBeVisible()
})

test('Renders the labels filter menu when clicking the button in Issue option', async () => {
  const props = getNotificationsSubscriptionsMenuWithLabelsProps()
  const {user} = render(<NotificationsSubscriptionsMenu {...props} />)

  await user.click(screen.getByTestId('notifications-subscriptions-menu-button-desktop'))
  await user.click(screen.getByText('Custom'))
  await user.click(screen.getByText('Labels:'))

  expect(screen.getByText('Select labels')).toBeVisible()

  expect(screen.getAllByRole('option', {name: 'bug'})[0]).toBeVisible()
  expect(screen.getAllByRole('option', {name: 'epic'})[0]).toBeVisible()

  expect(screen.getAllByText('Apply')[0]).toBeVisible()
  expect(screen.getAllByText('Cancel')[0]).toBeVisible()
})

test('Renders the filter labels input', async () => {
  const props = getNotificationsSubscriptionsMenuWithLabelsProps()
  const {user} = render(<NotificationsSubscriptionsMenu {...props} />)

  await user.click(screen.getByTestId('notifications-subscriptions-menu-button-desktop'))
  await user.click(screen.getByText('Custom'))
  await user.click(screen.getByText('Labels:'))

  const textField = screen.getByRole('textbox', {name: 'Filter labels'})
  expect(textField).toBeVisible()
})
