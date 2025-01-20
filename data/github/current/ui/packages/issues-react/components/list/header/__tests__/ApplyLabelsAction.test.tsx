import {renderRelay} from '@github-ui/relay-test-utils'
import {act, screen} from '@testing-library/react'
import {graphql, requestSubscription} from 'relay-runtime'
import {MockPayloadGenerator, createMockEnvironment} from 'relay-test-utils'
import type {RelayMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {noop} from '@github-ui/noop'
import {ApplyLabelsAction} from '../ApplyLabelsAction'
import type {ApplyLabelsActionTestQuery} from './__generated__/ApplyLabelsActionTestQuery.graphql'
import type {LabelPickerQuery} from '@github-ui/item-picker/LabelPickerQuery.graphql'
import {buildLabel} from '@github-ui/item-picker/test-utils/LabelPickerHelpers'

const mockSearchQuery = graphql`
  query ApplyLabelsActionTestQuery($ids: [ID!]!) @relay_test_operation {
    nodes(ids: $ids) {
      ... on Issue {
        # eslint-disable-next-line relay/unused-fields
        id
        # eslint-disable-next-line relay/unused-fields
        labels(first: 20, orderBy: {field: NAME, direction: ASC}) {
          nodes {
            # eslint-disable-next-line relay/must-colocate-fragment-spreads
            ...LabelPickerLabel
          }
        }
      }
    }
  }
`

const mockSubscription = (environment: RelayMockEnvironment, issueId: string) => {
  requestSubscription(environment, {
    subscription: graphql`
      subscription ApplyLabelsActionIssueRowTestSubscription($issueId: ID!) @relay_test_operation {
        issueUpdated(id: $issueId) {
          issueMetadataUpdated {
            ...Labels @arguments(labelPageSize: 20)
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

test('updates pre-selected labels on the picker with live update', async () => {
  const mockIssueId = 'issue-1'
  const mockLabels = [buildLabel({name: 'labelA'}), buildLabel({name: 'labelB'})]
  const mockLabelA = mockLabels[0]
  const environment = createMockEnvironment()
  const subscriptionOperation = mockSubscription(environment, mockIssueId)

  renderRelay<{labelPicker: LabelPickerQuery; subscription: ApplyLabelsActionTestQuery}>(
    () => (
      <ApplyLabelsAction
        repo="repo"
        owner="owner"
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
          labelPicker: {
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
            labels: null,
          }),
          Label: () => mockLabelA,
        },
        environment,
      },
      wrapper: Wrapper,
    },
  )

  // Find label picker button and click it
  const labelButton = screen.getByText('Label')
  expect(labelButton).not.toBeDisabled()
  act(() => labelButton.click())

  const list = screen.queryByLabelText('Label results')
  expect(list).toBeInTheDocument()
  expect(list).toBeVisible()

  const labelA = screen.queryByRole('option', {name: 'labelA'})
  expect(labelA).toBeInTheDocument()
  expect(labelA).toHaveAttribute('aria-selected', 'false')

  // Trigger subscription update with new label
  act(() => {
    environment.mock.nextValue(
      subscriptionOperation,
      MockPayloadGenerator.generate(subscriptionOperation, {
        Issue: () => ({
          id: mockIssueId,
          labels: {
            nodes: [mockLabelA],
          },
        }),
      }),
    )
  })

  expect(labelA).toHaveAttribute('aria-selected', 'true')
})
