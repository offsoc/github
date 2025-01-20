import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {mockFetch} from '@github-ui/mock-fetch'

import {MeteredEnterpriseServerLicenses} from '../MeteredEnterpriseServerLicenses'
import {
  getEmptyMeteredEnterpriseServerLicensesProps,
  getMeteredEnterpriseServerLicensesProps,
} from '../test-utils/mock-data'

beforeAll(() => {
  jest.spyOn(window, 'open').mockImplementation(() => null)
})

afterAll(() => {
  jest.resetAllMocks()
})

test('Renders message to add users when there are no users and no licenses', () => {
  const props = getEmptyMeteredEnterpriseServerLicensesProps()
  render(<MeteredEnterpriseServerLicenses {...props} />)
  expect(screen.getByText(/Enterprise Server licenses/i)).toBeInTheDocument()
  expect(screen.getByText(/You don't have any server licenses/i)).toBeInTheDocument()
  expect(screen.getByTestId('add-cloud-users-message')).toBeInTheDocument()
  expect(screen.queryByText(/Generate new license/i)).not.toBeInTheDocument()
})

test('Renders message to generate new license when there are users and no licenses', () => {
  const props = getEmptyMeteredEnterpriseServerLicensesProps()
  props.consumedEnterpriseLicenses = 1
  render(<MeteredEnterpriseServerLicenses {...props} />)
  expect(screen.getByText(/Enterprise Server licenses/i)).toBeInTheDocument()
  expect(screen.getByText(/You don't have any server licenses/i)).toBeInTheDocument()
  expect(screen.getByText(/Generate new license/i)).toBeInTheDocument()
  expect(screen.queryByTestId('add-cloud-users-message')).not.toBeInTheDocument()
})

test('Renders the MeteredEnterpriseServerLicenses with licenses', () => {
  const props = getMeteredEnterpriseServerLicensesProps()

  render(<MeteredEnterpriseServerLicenses {...props} />)
  for (const serverLicense of props.serverLicenses) {
    const expiresAt = new Date(Date.parse(serverLicense.expires_at))

    expect(screen.queryByTestId('license-status-banner')).not.toBeInTheDocument()
    expect(screen.getByText(/Enterprise Server licenses/i)).toBeInTheDocument()
    expect(screen.getByText(serverLicense.reference_number)).toBeInTheDocument()
    expect(screen.getByText(serverLicense.seats)).toBeInTheDocument()
    expect(screen.getByText(expiresAt.toDateString(), {exact: false})).toBeInTheDocument()
  }
})

test('Renders warning banner when GHEC user count does not match the active license count', async () => {
  const props = getMeteredEnterpriseServerLicensesProps()
  props.consumedEnterpriseLicenses = 100

  render(<MeteredEnterpriseServerLicenses {...props} />)

  expect(screen.getByTestId('license-status-banner')).toBeInTheDocument()
  expect(
    screen.getByText(
      /Your license usage for Enterprise Cloud has changed. Generate a new license key to update server seats./i,
    ),
  ).toBeInTheDocument()
  expect(screen.getByText(/Generate new license/i)).toBeInTheDocument()
})

test('Does not allow license generation when GHEC user count has changed to 0', async () => {
  const props = getMeteredEnterpriseServerLicensesProps()
  props.consumedEnterpriseLicenses = 0

  render(<MeteredEnterpriseServerLicenses {...props} />)

  expect(screen.queryByTestId('license-status-banner')).not.toBeInTheDocument()
  expect(screen.queryByText(/Generate new license/i)).not.toBeInTheDocument()
})

test('Renders success banner after license has been generated', async () => {
  const props = getEmptyMeteredEnterpriseServerLicensesProps()
  props.consumedEnterpriseLicenses = 100

  mockFetch.mockRouteOnce(`/enterprises/${props.business.slug}/metered_server_licenses`, {
    reference_number: '123',
    seats: 100,
    expires_at: '2022-01-01',
  })

  const {user} = render(<MeteredEnterpriseServerLicenses {...props} />)

  const link = screen.getByText(/Generate new license/i)
  await user.click(link)

  await expect(screen.findByTestId('license-status-banner')).resolves.toBeInTheDocument()
  await expect(
    screen.findByText(/New server license generated for 100 Enterprise Cloud users. Upload to your server instance/i),
  ).resolves.toBeInTheDocument()
  await expect(window.open).toHaveBeenCalledTimes(1)
})

test('Renders error banner when license generation fails', async () => {
  const props = getEmptyMeteredEnterpriseServerLicensesProps()
  props.consumedEnterpriseLicenses = 100

  mockFetch.mockRouteOnce(`/enterprises/${props.business.slug}/metered_server_licenses`, {}, {ok: false})

  const {user} = render(<MeteredEnterpriseServerLicenses {...props} />)

  const link = screen.getByText(/Generate new license/i)
  await user.click(link)

  await expect(screen.findByTestId('license-status-banner')).resolves.toBeInTheDocument()
  await expect(screen.findByText(/There was an error generating a new server license/i)).resolves.toBeInTheDocument()
})

test('Renders spinner + message while license generation is happening', async () => {
  const props = getEmptyMeteredEnterpriseServerLicensesProps()
  props.consumedEnterpriseLicenses = 100

  const {user} = render(<MeteredEnterpriseServerLicenses {...props} />)

  const link = screen.getByText(/Generate new license/i)
  await user.click(link)

  await expect(screen.findByTestId('generating-license')).resolves.toBeInTheDocument()
  await expect(
    screen.findByText(/Generating a new license for 100 Enterprise Cloud users/i),
  ).resolves.toBeInTheDocument()
})

test('adjusts partial when rendering within stafftools', async () => {
  const props = getEmptyMeteredEnterpriseServerLicensesProps()
  props.consumedEnterpriseLicenses = 100

  mockFetch.mockRouteOnce(`/stafftools/enterprises/${props.business.slug}/metered_server_licenses`, {
    reference_number: '123',
    seats: 100,
    expires_at: '2022-01-01',
  })

  const {user} = render(<MeteredEnterpriseServerLicenses {...props} isStafftools />)

  const link = screen.getByText(/Generate new license/i)
  await user.click(link)

  await expect(mockFetch.fetch).toHaveBeenCalledWith('/stafftools/enterprises/github-inc/metered_server_licenses', {
    method: 'POST',
    headers: expect.any(Object),
  })
  await expect(screen.findByRole('link', {name: 'Download'})).resolves.toHaveAttribute(
    'href',
    '/stafftools/enterprises/github-inc/metered_server_licenses/123',
  )
})

test('renders the audit log link when isStafftools is true', () => {
  const props = getEmptyMeteredEnterpriseServerLicensesProps()
  const fakeAuditLogUrl = 'test-url'
  render(<MeteredEnterpriseServerLicenses {...props} isStafftools auditLogQueryUrl={fakeAuditLogUrl} />)

  const link = screen.getByRole('link', {name: 'Audit Log'})

  expect(link).toBeVisible()
  expect(link).toHaveAttribute('href', fakeAuditLogUrl)
})

test('does not render the audit log link when isStafftools is false', () => {
  const props = getEmptyMeteredEnterpriseServerLicensesProps()
  render(<MeteredEnterpriseServerLicenses {...props} auditLogQueryUrl="test-url" />)

  expect(screen.queryByRole('link', {name: 'Audit Log'})).not.toBeInTheDocument()
})

test('does not render the audit log link when isStafftools is true but no audit log url is provided', () => {
  const props = getEmptyMeteredEnterpriseServerLicensesProps()
  render(<MeteredEnterpriseServerLicenses {...props} isStafftools />)

  expect(screen.queryByRole('link', {name: 'Audit Log'})).not.toBeInTheDocument()
})
