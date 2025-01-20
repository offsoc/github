import {act, screen} from '@testing-library/react'
import {SubscriptionSection} from '../SubscriptionSection'
import {renderRelay} from '@github-ui/relay-test-utils'
import type {QueryOptions} from '@github-ui/relay-test-utils/RelayTestFactories'
import {graphql} from 'relay-runtime'
import type {SubscriptionSectionTestQuery} from './__generated__/SubscriptionSectionTestQuery.graphql'
import {commitUpdateIssueSubscriptionMutation} from '../../../mutations/update-issue-subscription'
import {noop} from '@github-ui/noop'

jest.mock('../../../mutations/update-issue-subscription')
const subscriptionMutationMock = jest
  .mocked(commitUpdateIssueSubscriptionMutation)
  .mockImplementation(({onCompleted}) => {
    onCompleted?.()
    return {dispose: noop}
  })

const mockQuery = {
  type: 'fragment',
  query: graphql`
    query SubscriptionSectionTestQuery @relay_test_operation {
      repository(owner: "owner", name: "repo") {
        issue(number: 33) {
          ...SubscriptionSectionFragment
        }
      }
    }
  `,
  variables: {},
} satisfies QueryOptions<SubscriptionSectionTestQuery>

beforeEach(() => {
  subscriptionMutationMock.mockClear()
})

test('shows subscribe button', async () => {
  renderRelay<{subscriptionQuery: SubscriptionSectionTestQuery}>(
    ({queryData: {subscriptionQuery}}) => <SubscriptionSection issue={subscriptionQuery.repository!.issue!} />,
    {
      relay: {
        queries: {subscriptionQuery: mockQuery},
        mockResolvers: {
          Issue: (_ctx, id) => ({id: `${id()}`, viewerThreadSubscriptionFormAction: 'SUBSCRIBE'}),
        },
      },
    },
  )

  const subscriptionButton = screen.getByRole('button')
  expect(subscriptionButton).toHaveAccessibleName('Subscribe')
  expect(subscriptionButton).toHaveAccessibleDescription("You're not receiving notifications from this thread.")

  const announcementText = "You're now subscribed to this issue."
  expect(screen.queryByText(announcementText)).not.toBeInTheDocument()

  act(() => {
    subscriptionButton.click()
  })
  expect(subscriptionMutationMock).toHaveBeenCalledTimes(1)

  const announcement = screen.getByText(announcementText)
  expect(announcement).toHaveClass('sr-only')
  expect(announcement).toHaveAttribute('aria-live', 'polite')
})

test('shows the unsubscribe button', async () => {
  renderRelay<{subscriptionQuery: SubscriptionSectionTestQuery}>(
    ({queryData: {subscriptionQuery}}) => <SubscriptionSection issue={subscriptionQuery.repository!.issue!} />,
    {
      relay: {
        queries: {subscriptionQuery: mockQuery},
        mockResolvers: {
          Issue: (_ctx, id) => ({id: `${id()}`, viewerThreadSubscriptionFormAction: 'UNSUBSCRIBE'}),
        },
      },
    },
  )

  const subscriptionButton = screen.getByRole('button')
  expect(subscriptionButton).toHaveAccessibleName('Unsubscribe')
  expect(subscriptionButton).toHaveAccessibleDescription(
    "You're receiving notifications because you're subscribed to this thread.",
  )

  const announcementText = "You're now unsubscribed from this issue."
  expect(screen.queryByText(announcementText)).not.toBeInTheDocument()

  act(() => {
    subscriptionButton.click()
  })
  expect(subscriptionMutationMock).toHaveBeenCalledTimes(1)

  const announcement = screen.getByText(announcementText)
  expect(announcement).toHaveClass('sr-only')
  expect(announcement).toHaveAttribute('aria-live', 'polite')
})
