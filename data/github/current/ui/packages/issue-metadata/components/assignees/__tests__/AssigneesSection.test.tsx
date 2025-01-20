import {screen, fireEvent} from '@testing-library/react'

import {graphql} from 'react-relay'
import {EditIssueAssigneesSection} from '../AssigneesSection'
import type {MockResolvers} from 'relay-test-utils/lib/RelayMockPayloadGenerator'
import {renderRelay} from '@github-ui/relay-test-utils'
import type {AssigneesSectionTestQuery} from './__generated__/AssigneesSectionTestQuery.graphql'

const renderAssigneesSection = (mockResolvers?: MockResolvers) => {
  const {relayMockEnvironment} = renderRelay<{
    assignees: AssigneesSectionTestQuery
    assigneePicker: AssigneesSectionTestQuery
  }>(
    ({queryData}) => (
      <EditIssueAssigneesSection
        issue={queryData.assignees.repository!.issue!}
        viewer={queryData.assignees.viewer}
        singleKeyShortcutsEnabled={true}
      />
    ),
    {
      relay: {
        queries: {
          assignees: {
            type: 'fragment',
            query: graphql`
              query AssigneesSectionTestQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
                repository(owner: $owner, name: $repo) {
                  issue(number: $number) {
                    ...AssigneesSectionFragment
                  }
                }
                viewer {
                  # read with readInlineData
                  # eslint-disable-next-line relay/must-colocate-fragment-spreads
                  ...AssigneePickerAssignee
                }
              }
            `,
            variables: {owner: 'owner', repo: 'repo', number: 1},
          },
          assigneePicker: {
            type: 'lazy',
          },
        },
        mockResolvers,
      },
    },
  )

  return relayMockEnvironment
}

test('renders no buttons without permissions', async () => {
  renderAssigneesSection({
    Issue: () => ({
      assignees: {
        nodes: [],
      },
    }),
  })

  expect(screen.queryByText(/Edit Assignees/)).not.toBeInTheDocument()
  expect(screen.queryByText('Assign yourself')).not.toBeInTheDocument()
  expect(screen.getByText('No one assigned')).toBeInTheDocument()
})

test('renders button with edit permissions', async () => {
  renderAssigneesSection({
    Issue: () => ({
      assignees: {
        nodes: [],
      },
      viewerCanAssign: true,
    }),
  })

  expect(screen.getByText('Edit Assignees')).toBeInTheDocument()
  expect(screen.getByText('Assign yourself')).toBeInTheDocument()
})

test('does not render "assign yourself" button when there are already assignees', async () => {
  renderAssigneesSection({
    Issue: () => ({
      assignees: {
        nodes: [
          {
            login: 'monalisa',
          },
        ],
      },
      viewerCanAssign: true,
    }),
  })

  expect(screen.queryByText('Assign yourself')).not.toBeInTheDocument()
})

test('self assigns with self-assign link', async () => {
  renderAssigneesSection({
    Issue: () => ({
      assignees: {
        nodes: [],
      },
      viewerCanAssign: true,
    }),
    User: () => ({
      login: 'monalisa',
    }),
  })

  expect(screen.queryByText('monalisa')).not.toBeInTheDocument()

  const selfAssignLink = screen.getByText('Assign yourself')
  fireEvent.click(selfAssignLink)

  expect(screen.getByText('monalisa')).toBeInTheDocument()
})
