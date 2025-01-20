import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen, within} from '@testing-library/react'
import {PendingRequestCard} from '../PendingRequestCard'
import {getPendingRequests} from '../../../test-utils/mock-data'

const toggleSeatDialog = jest.fn()

describe('When there are some pending requests', () => {
  test('renders the pending request card when there are pending requests', () => {
    render(
      <PendingRequestCard
        pendingRequests={getPendingRequests()}
        organization="test-org"
        toggleSeatDialog={toggleSeatDialog}
      />,
    )

    const card = screen.queryByTestId('pending-requests-card')
    expect(card).toBeInTheDocument()
  })

  test('renders the correct number of requesters', () => {
    const count = 10
    const pendingRequests = {...getPendingRequests(), count}
    render(
      <PendingRequestCard
        pendingRequests={pendingRequests}
        organization="test-org"
        toggleSeatDialog={toggleSeatDialog}
      />,
    )

    const card = screen.queryByTestId('pending-requests-card')
    expect(card).toHaveTextContent('9 more members are waiting for access to Copilot')
  })

  test('renders the first requester', () => {
    render(
      <PendingRequestCard
        pendingRequests={getPendingRequests()}
        organization="test-org"
        toggleSeatDialog={toggleSeatDialog}
      />,
    )

    const card = screen.queryByTestId('pending-requests-card')
    expect(card).toHaveTextContent('@user1')
  })

  test('renders the Review access requests button', () => {
    render(
      <PendingRequestCard
        pendingRequests={getPendingRequests()}
        organization="test-org"
        toggleSeatDialog={toggleSeatDialog}
      />,
    )

    const card = screen.getByTestId('pending-requests-card')
    const button = within(card).queryByTestId('review-access-requests-button')
    expect(button).toBeInTheDocument()
  })

  test('triggers hydro event when Review access requests button is clicked', () => {
    render(
      <PendingRequestCard
        pendingRequests={getPendingRequests()}
        organization="test-org"
        toggleSeatDialog={toggleSeatDialog}
      />,
    )

    const card = screen.getByTestId('pending-requests-card')
    const button = within(card).getByTestId('review-access-requests-button')
    fireEvent.click(button)

    expectAnalyticsEvents({
      type: 'analytics.click',
      data: {
        category: 'copilot_access_management',
        action: `click_to_open_add_seats_dialog`,
        label: `ref_cta:review_access_requests;ref_loc:pending_requests_card`,
      },
    })
  })
})

describe('When there are no pending requests', () => {
  test('renders nothing when pendingRequests is undefined', () => {
    render(
      <PendingRequestCard pendingRequests={undefined} organization="test-org" toggleSeatDialog={toggleSeatDialog} />,
    )

    const card = screen.queryByTestId('pending-requests-card')
    expect(card).not.toBeInTheDocument()
  })

  test('renders nothing when pending request count is 0', () => {
    render(
      <PendingRequestCard
        pendingRequests={{count: 0, requesters: []}}
        organization="test-org"
        toggleSeatDialog={toggleSeatDialog}
      />,
    )

    const card = screen.queryByTestId('pending-requests-card')
    expect(card).not.toBeInTheDocument()
  })

  test('renders nothing when pending requester length is 0', () => {
    render(
      <PendingRequestCard
        pendingRequests={{count: 1, requesters: []}}
        organization="test-org"
        toggleSeatDialog={toggleSeatDialog}
      />,
    )

    const card = screen.queryByTestId('pending-requests-card')
    expect(card).not.toBeInTheDocument()
  })
})
