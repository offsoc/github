import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

import type {OrganizationRecord} from '../../types/settings-types'

// Component(s) under test
import CustomRouteSettings, {FALLBACK_TEXT} from '../CustomRouteSettings'
import type {CustomRoutesPayload} from '../../types/custom-route-types'

/// Default mapping for 'bizzbuzz' organization
const DEFAULT_ROUTE_STUB: OrganizationRecord = {
  id: 0,
  avatarUrl: '',
  login: 'bizzbuzz',
  email: 'monalisa@example.com',
  canReceiveNotifications: true,
  restrictNotificationsToVerifiedEmail: true,
  userHasEmailEligableDomainNotificationEmail: true,
  notifiableEmailsForUser: ['bizzbuzz@example.com'],
  display: false,
}

/// Custom mapping for 'foobar' organization
const CUSTOM_ROUTE_STUB: OrganizationRecord = {
  id: 1,
  avatarUrl: '',
  login: 'foobar',
  email: 'monalisa@example.com',
  canReceiveNotifications: true,
  restrictNotificationsToVerifiedEmail: true,
  userHasEmailEligableDomainNotificationEmail: true,
  notifiableEmailsForUser: ['foobar@example.com'],
  display: true,
}

/// Second custom mapping for 'davinci' organization
const CUSTOM_ROUTE_STUB_2: OrganizationRecord = {
  id: 2,
  avatarUrl: '',
  login: 'davinci',
  email: 'monalisa-davinci@example.com',
  canReceiveNotifications: true,
  restrictNotificationsToVerifiedEmail: true,
  userHasEmailEligableDomainNotificationEmail: true,
  notifiableEmailsForUser: ['monalisa@example.com', 'monalisa-davinci@example.com'],
  display: true,
}

const PAYLOAD_STUB: CustomRoutesPayload = {
  organizationRecords: [DEFAULT_ROUTE_STUB, CUSTOM_ROUTE_STUB, CUSTOM_ROUTE_STUB_2],
  newsiesAvailable: true,
  verificationEnabled: true,
  globalEmailAddress: 'monalisa@example.com',
}

describe('CustomRouteSettings', () => {
  describe('rendering', () => {
    test('renders fallback', () => {
      // Override payload so that list of organizations is empty
      render(<CustomRouteSettings payload={{...PAYLOAD_STUB, organizationRecords: []}} />)
      expect(screen.getByText(FALLBACK_TEXT)).toBeVisible()
    })

    test('renders fallback if all routes are default', () => {
      // Override payload so that list of organizations only contains default route(s)
      const organizationRecords = [DEFAULT_ROUTE_STUB]
      render(<CustomRouteSettings payload={{...PAYLOAD_STUB, organizationRecords}} />)
      expect(screen.getByText(FALLBACK_TEXT)).toBeVisible()
    })

    test('renders displayed routes', () => {
      render(<CustomRouteSettings payload={PAYLOAD_STUB} />)
      expect(screen.getByText(CUSTOM_ROUTE_STUB.login)).toBeVisible()
      expect(screen.queryByText(DEFAULT_ROUTE_STUB.login)).toBeNull()
    })

    test('renders displayed routes in login ascending order', () => {
      render(<CustomRouteSettings payload={PAYLOAD_STUB} />)

      // We retrieve the list of displayed routes by querying the DOM for the
      // CustomRouteRow components, which have a 'data-testid' tag for lookup
      const rows = screen.getAllByTestId('custom-route-row')
      expect(rows.length).toEqual(2)

      // We cast the retrieved HTML elements into HTML text strings to
      // get their contents then pull out the 1st and 2nd positions to compare them
      const [davinci, foobar] = rows.map(e => e.innerHTML)

      // Assert 'd' comes before 'f'
      expect(davinci).toContain('davinci')
      expect(foobar).toContain('foobar')
    })
  })

  describe('edit actions', () => {
    test('an existing route can enter edit mode if we are allowed to edit', async () => {
      const {user} = render(<CustomRouteSettings payload={PAYLOAD_STUB} />)

      // Click the edit button for the first route
      const actions = screen.getAllByTestId('custom-route-row-actions')
      await user.click(actions[0]!)
      await user.click(screen.getByText('Edit'))

      // Assert that the edit form is visible
      expect(screen.getByText('Save')).toBeVisible()
      expect(screen.getByText('Cancel')).toBeVisible()
    })
    test('a new route can be created if we are alowed to edit', async () => {
      const {user} = render(<CustomRouteSettings payload={PAYLOAD_STUB} />)

      // Click the 'add row' button
      await user.click(screen.getByText('Add new route'))

      // Assert that the edit form is visible
      expect(screen.getByText('Save')).toBeVisible()
      expect(screen.getByText('Cancel')).toBeVisible()
    })
  })

  describe('edit mode blocks actions', () => {
    test('an existing route cannot enter edit mode if we are not allowed to edit', async () => {
      const {user} = render(<CustomRouteSettings payload={PAYLOAD_STUB} />)

      // Click the edit button for the first route
      const actions = screen.getAllByTestId('custom-route-row-actions')
      await user.click(actions[0]!)
      await user.click(screen.getByText('Edit'))

      await user.click(actions[1]!)
      const buttons = screen.getAllByRole('menuitem')
      expect(buttons[0]!.attributes.getNamedItem('aria-disabled')).toBeTruthy()
    })
    test('a new route cannot be created if we are not alowed to edit', async () => {
      const {user} = render(<CustomRouteSettings payload={PAYLOAD_STUB} />)

      // Click the edit button for the first route
      const actions = screen.getAllByTestId('custom-route-row-actions')
      await user.click(actions[0]!)
      await user.click(screen.getByText('Edit'))

      expect(screen.getByRole('button', {name: 'Add new route'})).toBeDisabled()
    })
  })

  describe('organization selection', () => {
    test('that organization selector can display all organizations', async () => {
      // Override props so that there are no custom routes, and every organization has a default route
      const {user} = render(
        <CustomRouteSettings
          payload={{
            ...PAYLOAD_STUB,
            organizationRecords: PAYLOAD_STUB.organizationRecords.map(o => ({...o, display: false})),
          }}
        />,
      )

      // Click the 'add row' button
      await user.click(screen.getByText('Add new route'))

      // Expect org drop-down to pre-open and render all organizations
      expect(screen.getByText('foobar')).toBeVisible()
      expect(screen.getByText('davinci')).toBeVisible()
      expect(screen.getByText('bizzbuzz')).toBeVisible()
    })
    test('that organization selector filters out displayed organizations', async () => {
      const {user} = render(<CustomRouteSettings payload={PAYLOAD_STUB} />)

      // Click the 'add row' button
      await user.click(screen.getByText('Add new route'))

      // Expect org drop-down to pre-open and render only organizations without custom routes
      const options = screen.getAllByRole('option')
      expect(options.length).toEqual(2) // One is a placeholder for "Select Email"
      expect(screen.getByText('bizzbuzz')).toBeVisible()
    })
  })

  describe('email picker experience', () => {
    test('picker opens and closes automatically', async () => {
      const {user} = render(<CustomRouteSettings payload={PAYLOAD_STUB} />)

      // Click the 'add row' button
      await user.click(screen.getByText('Add new route'))

      // Select a valid options
      await user.click(screen.getByText('bizzbuzz'))

      const options = screen.getAllByTestId('email-option')
      expect(options.length).toEqual(DEFAULT_ROUTE_STUB.notifiableEmailsForUser.length)
      expect(screen.getByText('bizzbuzz@example.com')).toBeVisible()
    })
  })
})
