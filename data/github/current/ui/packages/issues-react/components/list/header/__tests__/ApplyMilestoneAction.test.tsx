import {renderRelay} from '@github-ui/relay-test-utils'
import {act, screen} from '@testing-library/react'
import {graphql, requestSubscription} from 'relay-runtime'
import {MockPayloadGenerator, createMockEnvironment} from 'relay-test-utils'
import type {RelayMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {noop} from '@github-ui/noop'
import type {MilestonePickerQuery} from '@github-ui/item-picker/MilestonePickerQuery.graphql'
import {ApplyMilestoneAction} from '../ApplyMilestoneAction'
import type {ApplyMilestoneActionTestQuery} from './__generated__/ApplyMilestoneActionTestQuery.graphql'

const mockSearchQuery = graphql`
  query ApplyMilestoneActionTestQuery($ids: [ID!]!) @relay_test_operation {
    nodes(ids: $ids) {
      ... on Issue {
        # eslint-disable-next-line relay/unused-fields
        id
        # eslint-disable-next-line relay/unused-fields
        milestone {
          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...MilestonePickerMilestone
        }
      }
    }
  }
`

const mockSubscription = (environment: RelayMockEnvironment, issueId: string) => {
  requestSubscription(environment, {
    subscription: graphql`
      subscription ApplyMilestoneActionIssueRowTestSubscription($issueId: ID!) @relay_test_operation {
        issueUpdated(id: $issueId) {
          issueMetadataUpdated {
            ...MilestonesSectionMilestone
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

test('updates pre-selected milestone on the picker with live update', async () => {
  const mockIssueId = 'issue-2'
  const mockMilestone = {
    id: `milestone-2`,
    title: `Beta ship`,
    state: 'OPEN',
  }

  const environment = createMockEnvironment()
  const subscriptionOperation = mockSubscription(environment, mockIssueId)

  renderRelay<{
    search: ApplyMilestoneActionTestQuery
    picker: MilestonePickerQuery
  }>(
    () => (
      <ApplyMilestoneAction
        owner="github"
        repo="issues"
        issueIds={[mockIssueId]}
        issuesToActOn={[mockIssueId]}
        disabled={false}
        singleKeyShortcutsEnabled={false}
        useQueryForAction={false}
      />
    ),
    {
      relay: {
        queries: {
          search: {
            type: 'preloaded',
            query: mockSearchQuery,
            variables: {
              ids: [mockIssueId],
            },
          },
          picker: {
            type: 'lazy',
          },
        },
        mockResolvers: {
          Issue: () => ({
            id: mockIssueId,
            milestone: null,
          }),
          Milestone: () => mockMilestone,
        },
        environment,
      },
      wrapper: Wrapper,
    },
  )

  // Find milestone picker button and click it
  const milestoneButton = screen.getByText('Milestone')
  expect(milestoneButton).toBeVisible()
  act(() => milestoneButton.click())

  // Expect mock milestone not to be pre-selected
  const betaMilestone = screen.getByRole('option', {name: 'Beta ship'})
  expect(betaMilestone).toHaveAttribute('aria-selected', 'false')

  // Trigger subscription update with new milestone
  act(() => {
    environment.mock.nextValue(
      subscriptionOperation,
      MockPayloadGenerator.generate(subscriptionOperation, {
        Issue: () => ({
          id: mockIssueId,
          milestone: mockMilestone,
        }),
      }),
    )
  })

  // Expect mock milestone to be pre-selected after subscription updates
  expect(betaMilestone).toHaveAttribute('aria-selected', 'true')
})
