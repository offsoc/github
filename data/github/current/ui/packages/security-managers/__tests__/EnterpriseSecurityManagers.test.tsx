import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {screen} from '@testing-library/react'

import {EnterpriseSecurityManagers} from '../routes/EnterpriseSecurityManagers'
import {
  getEnterpriseSecurityManagersRouteDeleteDisabledPayload,
  getEnterpriseSecurityManagersRoutePayload,
  getEnterpriseSecurityManagersRouteReadonlyPayload,
} from '../test-utils/mock-data'
import {render} from '../test-utils/render'

const mockVerifiedFetchJSON = verifiedFetchJSON as jest.Mock

jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetchJSON: jest.fn(),
}))

describe('EnterpriseSecurityManagers', () => {
  beforeEach(() => {
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: true,
      json: async () => {
        return {teams: [{name: 'Team 1', slug: 'team-1', path: '/team-1'}], totalPages: 1}
      },
    })
  })

  it('renders successfully', async () => {
    const routePayload = getEnterpriseSecurityManagersRoutePayload()
    render(<EnterpriseSecurityManagers />, {routePayload})

    expect(await screen.findByTestId('esm-team-team-1')).toBeInTheDocument()
    expect(await screen.findByTestId('column-options-team-1')).toBeInTheDocument()
  })

  it('renders an assign button when the user is a business owner', async () => {
    const routePayload = getEnterpriseSecurityManagersRoutePayload()
    render(<EnterpriseSecurityManagers />, {routePayload})

    expect(await screen.findByTestId('assignment-dialog-button')).toBeInTheDocument()
  })

  it('does not render an assign button when the user is not a business owner', async () => {
    const routePayload = getEnterpriseSecurityManagersRouteReadonlyPayload()
    render(<EnterpriseSecurityManagers />, {routePayload})

    expect(screen.queryByTestId('assignment-dialog-button')).not.toBeInTheDocument()
  })

  it('does not render column options if not a business owner', async () => {
    const routePayload = getEnterpriseSecurityManagersRouteReadonlyPayload()
    render(<EnterpriseSecurityManagers />, {routePayload})

    expect(screen.queryByTestId('column-options-team-1')).not.toBeInTheDocument()
  })

  it('does not render column options if remove team is disabled', async () => {
    const routePayload = getEnterpriseSecurityManagersRouteDeleteDisabledPayload()
    render(<EnterpriseSecurityManagers />, {routePayload})

    expect(screen.queryByTestId('column-options-team-1')).not.toBeInTheDocument()
  })
})
