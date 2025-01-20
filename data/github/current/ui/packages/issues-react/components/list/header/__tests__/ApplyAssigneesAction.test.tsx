import {renderRelay} from '@github-ui/relay-test-utils'
import {act, screen} from '@testing-library/react'
import {graphql, requestSubscription} from 'relay-runtime'
import {ApplyAssigneesAction} from '../ApplyAssigneesAction'
import {MockPayloadGenerator, createMockEnvironment} from 'relay-test-utils'
import type {RelayMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {noop} from '@github-ui/noop'

const mockSearchQuery = graphql`
  query ApplyAssigneesActionTestQuery($ids: [ID!]!) @relay_test_operation {
    nodes(ids: $ids) {
      ... on Issue {
        # eslint-disable-next-line relay/unused-fields
        id
        # eslint-disable-next-line relay/unused-fields
        assignees(first: 20) {
          edges {
            node {
              # It is used but by readInlineData
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...AssigneePickerAssignee
            }
          }
        }
      }
    }
  }
`

const mockSubscription = (environment: RelayMockEnvironment, issueId: string) => {
  requestSubscription(environment, {
    subscription: graphql`
      subscription ApplyAssigneesActionIssueRowTestSubscription($issueId: ID!) @relay_test_operation {
        issueUpdated(id: $issueId) {
          issueMetadataUpdated {
            ...Assignees @arguments(assigneePageSize: 20)
          }
        }
      }
    `,
    onNext: noop,
    onError: noop,
    variables: {issueId},
  })

  return environment.mock.getMostRecentOperation()
}

test('updates pre-selected assignees on the picker with live update', async () => {
  const mockIssueId = 'issue-1'
  const mockUser = {
    id: 'user-1',
    login: 'monalisa',
    name: 'Mona Lisa',
  }

  const environment = createMockEnvironment()
  const subscriptionOperation = mockSubscription(environment, mockIssueId)

  renderRelay(
    () => (
      <ApplyAssigneesAction
        issueIds={[mockIssueId]}
        issuesToActOn={[mockIssueId]}
        repo="repo"
        owner="owner"
        disabled={false}
        singleKeyShortcutsEnabled={false}
        useQueryForAction={false}
      />
    ),
    {
      relay: {
        queries: {
          search: {
            type: 'lazy',
          },
          subscription: {
            type: 'preloaded',
            query: mockSearchQuery,
            variables: {
              ids: [mockIssueId],
            },
          },
        },
        mockResolvers: {
          Issue: () => ({
            id: mockIssueId,
            // Mock no assignees for issue initially
            assignees: {
              edges: [],
            },
          }),
          User: () => mockUser,
        },
        environment,
      },
      wrapper: Wrapper,
    },
  )

  // Find assign picker button and click it
  const assignButton = screen.getByText('Assign')
  expect(assignButton).toBeVisible()
  act(() => assignButton.click())

  // Expect mock user not to be pre-selected
  const monalisaUser = screen.getByRole('option', {name: 'monalisa'})
  expect(monalisaUser).toHaveAttribute('aria-selected', 'false')

  // Trigger subscription update with new assignee
  act(() => {
    environment.mock.nextValue(
      subscriptionOperation,
      MockPayloadGenerator.generate(subscriptionOperation, {
        Issue: () => ({
          id: mockIssueId,
          assignees: {
            edges: [
              {
                node: mockUser,
              },
            ],
          },
        }),
      }),
    )
  })

  // Expect mock user to be pre-selected because of the subscription update
  expect(monalisaUser).toHaveAttribute('aria-selected', 'true')
})
