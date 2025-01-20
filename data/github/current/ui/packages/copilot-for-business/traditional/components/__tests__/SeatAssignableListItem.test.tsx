import {fireEvent, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {AssignableUser, AssignableUserWithFeatureRequest} from '../../../test-utils/mock-data'
import SeatAssignableListItem from '../SeatAssignableListItem'

describe('SeatAssignableListItem', () => {
  test('renders a user seat', () => {
    render(<SeatAssignableListItem owner="blah" member={AssignableUser} />)
    const hovercard = screen.getByTestId(`seat-assignable-name-hover-${AssignableUser.type}-${AssignableUser.id}`)
    expect(hovercard).toHaveAttribute('href', `/orgs/blah/people/${AssignableUser.display_login}`)
    expect(hovercard).toHaveAttribute('data-hovercard-url', `/users/${AssignableUser.display_login}/hovercard`)
  })

  test('renders a user seat with a feature request', () => {
    render(<SeatAssignableListItem owner="blah" member={AssignableUserWithFeatureRequest} />)
    const status = screen.getByTestId(`seat-assignable-status-${AssignableUser.type}-${AssignableUser.id}`)
    expect(status).toHaveTextContent('Requested')
  })

  describe('dismiss request', () => {
    test('renders option to dismiss user feature request', () => {
      const dismissRequest = jest.fn()

      render(
        <SeatAssignableListItem
          owner="blah"
          member={AssignableUserWithFeatureRequest}
          dismissRequest={dismissRequest}
        />,
      )
      const status = screen.getByTestId(
        `seat-assignable-status-${AssignableUser.type}-${AssignableUserWithFeatureRequest.id}`,
      )
      expect(status).toHaveTextContent('Requested')

      const actionMenu = screen.getByTestId(
        `dismiss-request-menu-${AssignableUser.type}-${AssignableUserWithFeatureRequest.id}`,
      )
      expect(actionMenu).toBeInTheDocument()
      fireEvent.click(actionMenu)
      const dismissButton = screen.getByTestId(
        `dismiss-request-button-${AssignableUser.type}-${AssignableUserWithFeatureRequest.id}`,
      )
      expect(dismissButton).toBeInTheDocument()
    })

    test('dismisses user feature request', () => {
      const dismissRequest = jest.fn()

      render(
        <SeatAssignableListItem
          owner="blah"
          member={AssignableUserWithFeatureRequest}
          dismissRequest={dismissRequest}
        />,
      )
      const status = screen.getByTestId(
        `seat-assignable-status-${AssignableUser.type}-${AssignableUserWithFeatureRequest.id}`,
      )
      expect(status).toHaveTextContent('Requested')
      const actionMenu = screen.getByTestId(
        `dismiss-request-menu-${AssignableUser.type}-${AssignableUserWithFeatureRequest.id}`,
      )
      expect(actionMenu).toBeInTheDocument()
      fireEvent.click(actionMenu)
      const dismissButton = screen.getByTestId(
        `dismiss-request-button-${AssignableUser.type}-${AssignableUserWithFeatureRequest.id}`,
      )
      expect(dismissButton).toBeInTheDocument()
      fireEvent.click(dismissButton)
      expect(dismissRequest).toHaveBeenCalledWith(
        AssignableUserWithFeatureRequest.feature_request!.id,
        AssignableUserWithFeatureRequest.id,
      )
    })
  })
})
