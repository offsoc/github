import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

import type {OrganizationRecord} from '../../types/settings-types'

// Component(s) under test
import OrganizationSelect from '../dropdown/OrganizationSelect'

const ORGANIZATION_STUB: OrganizationRecord[] = [
  {
    id: 1,
    avatarUrl: '',
    login: 'foobar',
    email: 'monalisa@example.com',
    canReceiveNotifications: true,
    restrictNotificationsToVerifiedEmail: true,
    userHasEmailEligableDomainNotificationEmail: true,
    notifiableEmailsForUser: ['foobar@example.com'],
    display: true,
  },
  {
    id: 2,
    avatarUrl: '',
    login: 'bizzbuzz',
    email: 'monalisa@example.com',
    canReceiveNotifications: true,
    restrictNotificationsToVerifiedEmail: true,
    userHasEmailEligableDomainNotificationEmail: true,
    notifiableEmailsForUser: ['bizzbuzz@example.com'],
    display: true,
  },
]

describe('OrganizationSelect Dropdown', () => {
  test('renders without props.organizations', async () => {
    const {user} = render(<OrganizationSelect organizations={[]} />)

    const dropButton = screen.getByRole('button')
    expect(dropButton).toBeVisible()
    expect(screen.getByText('Pick organization')).toBeVisible()
    await user.click(dropButton)

    expect(screen.queryByText('foobar')).toBeNull()
  })

  test('renders without a selection', () => {
    // Render the component as if it was already opened
    render(<OrganizationSelect organizations={ORGANIZATION_STUB} open={true} />)

    expect(screen.getByText('foobar')).toBeVisible()
    expect(screen.getByText('bizzbuzz')).toBeVisible()
  })

  test('renders with a selection', () => {
    render(<OrganizationSelect organizations={ORGANIZATION_STUB} orgLogin={'bizzbuzz'} />)

    expect(screen.getByRole('button')).toBeVisible()
    expect(screen.getByText('bizzbuzz')).toBeVisible()
  })

  test('selects an organization', async () => {
    const {user} = render(<OrganizationSelect organizations={ORGANIZATION_STUB} />)

    expect(screen.getByRole('button')).toBeVisible()

    // Select 'foobar'
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('foobar'))

    // Change selection to 'bizzbuzz'
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('bizzbuzz'))

    expect(screen.getByText('bizzbuzz')).toBeVisible()
    expect(screen.queryByText('foobar')).toBeNull()
  })

  test('callbacks with selected organization', async () => {
    // Keep track of received calls
    const calls: string[] = []
    const callback: {(payload: string): void} = opt => calls.push(opt)

    const {user} = render(<OrganizationSelect organizations={ORGANIZATION_STUB} onChange={callback} />)

    // Click open the selector and choose 'second'
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('foobar'))

    // Expect 'second' to be in callback
    expect(calls.length).toBeGreaterThan(0)
    expect(calls[0]).toBe('foobar')

    // Repeat above but select 'first' and close selector
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('bizzbuzz'))
    await user.click(screen.getByRole('button'))
    expect(calls.length).toBeGreaterThan(1)
    expect(calls[1]).toBe('bizzbuzz')
  })
})
