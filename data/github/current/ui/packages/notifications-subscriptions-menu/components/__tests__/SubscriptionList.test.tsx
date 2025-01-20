import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import SubscriptionList from '../SubscriptionList'

const list = (
  <SubscriptionList
    selected={'none'}
    onSelect={() => {
      return 'selecting'
    }}
  />
)

describe('SubscriptionList', () => {
  test('renders the subscriptions list', () => {
    render(list)

    expect(screen.getByRole('list')).toBeVisible()
  })

  test('renders the subscriptions list items titles', () => {
    render(list)

    expect(screen.getAllByRole('listitem', {name: 'Participating and @mentions'})[0]).toBeVisible()
    expect(screen.getAllByRole('listitem', {name: 'All Activity'})[0]).toBeVisible()
    expect(screen.getAllByRole('listitem', {name: 'Ignore'})[0]).toBeVisible()
    expect(screen.getAllByRole('listitem', {name: 'Custom'})[0]).toBeVisible()
  })

  test('renders the subscriptions list items descriptions', () => {
    render(list)

    expect(
      screen.getByText('Only receive notifications from this repository when participating or @mentioned.'),
    ).toBeVisible()
    expect(screen.getByText('Notified of all notifications on this repository.')).toBeVisible()
    expect(screen.getByText('Never be notified.')).toBeVisible()
    expect(
      screen.getByText('Select events you want to be notified of in addition to participating and @mentions.'),
    ).toBeVisible()
  })
})
