import {fireEvent, screen} from '@testing-library/react'
import {OrgSelect} from '../OrgSelect'
import {render} from '@github-ui/react-core/test-utils'

const organizations = [
  {
    id: 1,
    displayLogin: 'org-1',
    path: '/orgs/org-1',
    avatarUrl: '/orgs/orgs-1/avatar',
    memberCount: 1,
    enablementStatus: 'disabled',
  },
]

describe('OrgSelect', () => {
  test('renders expected elements', () => {
    render(
      <OrgSelect organizations={organizations} orgsToUpdate={{}} setOrgsToUpdate={jest.fn()} disableForm={false}>
        <div>Fake children</div>
      </OrgSelect>,
    )
    const orgSelect = screen.getByTestId('org-select')
    expect(orgSelect).toBeInTheDocument()
    expect(orgSelect).toHaveTextContent('Fake children')
    expect(orgSelect).toHaveTextContent('org-1')
  })
  test('clicking on bulk action updates parent state', async () => {
    const mockHandler = jest.fn()

    render(
      <OrgSelect organizations={organizations} orgsToUpdate={{}} setOrgsToUpdate={mockHandler} disableForm={false}>
        <div>Fake children</div>
      </OrgSelect>,
    )
    const menuButton = await screen.findByText('Disabled')
    fireEvent.click(menuButton)
    const enabledButton = await screen.findByText('Enabled')
    fireEvent.click(enabledButton)
    expect(mockHandler.mock.calls.length).toBe(1)
  })
  test('clicking on bulk action checkbox, checks all item checkboxes', async () => {
    render(
      <OrgSelect organizations={organizations} orgsToUpdate={{}} setOrgsToUpdate={jest.fn()} disableForm={false}>
        <div>Fake children</div>
      </OrgSelect>,
    )
    const checkAllBox = await screen.findByTestId('select-all-checkbox')
    fireEvent.click(checkAllBox)

    const checkboxes = screen.getAllByTestId('org-item-checkbox')
    for (const checkbox of checkboxes as HTMLInputElement[]) {
      expect(checkbox.checked).toBe(true)
    }
  })
})
