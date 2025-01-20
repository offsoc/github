import {fireEvent, screen} from '@testing-library/react'
import {OrgItem} from '../OrgItem'
import {render} from '@github-ui/react-core/test-utils'

const org = {
  id: 1,
  displayLogin: 'org-1',
  path: '/orgs/org-1',
  avatarUrl: '/orgs/orgs-1/avatar',
  memberCount: 1,
  enablementStatus: 'disabled',
}

describe('OrgItem', () => {
  test('renders org name and members counts', () => {
    render(
      <OrgItem
        org={org}
        enabled={true}
        disableForm={false}
        updateOrgEnablement={jest.fn()}
        checked={false}
        handleCheckClick={jest.fn()}
      />,
    )
    const orgItem = screen.getByTestId('org-item')
    expect(orgItem).toBeInTheDocument()
    expect(orgItem).toHaveTextContent('1 member')
    expect(orgItem).toHaveTextContent('org-1')
  })

  test('change handler fires on enablement change', async () => {
    const mockHandler = jest.fn()
    render(
      <OrgItem
        org={org}
        enabled={false}
        disableForm={false}
        updateOrgEnablement={mockHandler}
        checked={false}
        handleCheckClick={jest.fn()}
      />,
    )
    const menuButton = await screen.findByText('Disabled')
    fireEvent.click(menuButton)
    const enabledButton = await screen.findByText('Enabled')
    fireEvent.click(enabledButton)
    expect(mockHandler.mock.calls.length).toBe(1)
  })
})
