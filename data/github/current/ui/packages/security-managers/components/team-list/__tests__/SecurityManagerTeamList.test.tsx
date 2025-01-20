import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {screen, waitFor} from '@testing-library/react'
import Router from 'react-router-dom'

import {render} from '../../../test-utils/render'
import {SecurityManagerTeamList} from '../SecurityManagerTeamList'

const mockVerifiedFetchJSON = verifiedFetchJSON as jest.Mock
jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetchJSON: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}))

beforeAll(() => {
  jest.spyOn(Router, 'useParams').mockReturnValue({business: 'github'})
})

describe('SecurityManagerTeamList', () => {
  it('renders successfully', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: true,
      json: async () => {
        return {teams: [{name: 'Team 1', slug: 'team-1', path: '/team-1'}], totalPages: 1}
      },
    })

    render(<SecurityManagerTeamList search="" />)

    expect(await screen.findByTestId('esm-team-team-1')).toBeInTheDocument()
  })

  it('renders a blank slate when there are no teams', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: true,
      json: async () => {
        return {teams: [], totalPages: 0}
      },
    })

    render(<SecurityManagerTeamList search="" />)

    await waitFor(async () => {
      expect(screen.getByText('No security manager teams found')).toBeInTheDocument()
    })
  })

  it('renders an error message when the fetch fails', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    render(<SecurityManagerTeamList search="" />)

    expect(await screen.findByText('Error loading security manager teams, please try again.')).toBeInTheDocument()
  })

  it('renders a dialog when a assignment is removed', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: true,
      json: async () => {
        return {teams: [{name: 'Team 1', slug: 'team-1', path: '/team-1'}], totalPages: 1}
      },
    })

    const {user} = render(<SecurityManagerTeamList search="" />)
    expect(screen.queryByTestId('remove-security-manager-dialog')).not.toBeInTheDocument()

    expect(await screen.findByTestId('esm-team-team-1')).toBeInTheDocument()

    const menu = await screen.findByRole('button', {name: 'Open column options'})
    user.click(menu)

    const removeButton = await screen.findByTestId('remove-team-team-1')
    user.click(removeButton)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    const confirmButton = await screen.findByRole('button', {name: 'Remove security manager team permission'})
    expect(confirmButton).toBeInTheDocument()
  })

  it('does not render a remove button when the user is not a business owner', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: true,
      json: async () => {
        return {teams: [{name: 'Team 1', slug: 'team-1', path: '/team-1'}], totalPages: 1}
      },
    })

    render(<SecurityManagerTeamList search="" hideRemoveAction />)

    expect(await screen.findByTestId('esm-team-team-1')).toBeInTheDocument()
    expect(screen.queryByTestId('remove-team-team-1')).not.toBeInTheDocument()
  })
})
