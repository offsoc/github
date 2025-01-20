import {screen} from '@testing-library/react'
import {renderRelay} from '@github-ui/relay-test-utils'
import {graphql, useFragment} from 'react-relay'
import {IssueSidebar} from '../IssueSidebar'
import type {IssueSidebarTestQuery} from './__generated__/IssueSidebarTestQuery.graphql'
import type {IssueViewerViewer$key} from '../__generated__/IssueViewerViewer.graphql'
import {issueViewerViewerFragment} from '../IssueViewer'
import {BUTTON_LABELS} from '../../constants/buttons'
import {noop} from '@github-ui/noop'
import type {IssueSidebarLazyTestQuery} from './__generated__/IssueSidebarLazyTestQuery.graphql'
import {setupUserEvent} from '@github-ui/react-core/test-utils'

const optionConfig = {
  singleKeyShortcutsEnabled: true,
  navigate: noop,
}

graphql`
  query IssueSidebarLazyTestQuery @relay_test_operation {
    node(id: "test-id") {
      ...IssueSidebarLazySections
    }
  }
`

function renderTestComponent({viewerCanType = true, withViewer = true} = {}) {
  return renderRelay<{
    sidebarQuery: IssueSidebarTestQuery
    lazySidebarQuery: IssueSidebarLazyTestQuery
  }>(
    ({queryData}) => {
      const viewer = useFragment<IssueViewerViewer$key>(issueViewerViewerFragment, queryData.sidebarQuery.viewer)

      return (
        <IssueSidebar
          sidebarKey={queryData.sidebarQuery.node!}
          viewer={withViewer ? viewer : null}
          optionConfig={optionConfig}
        />
      )
    },
    {
      relay: {
        queries: {
          sidebarQuery: {
            type: 'fragment',
            query: graphql`
              query IssueSidebarTestQuery @relay_test_operation {
                node(id: "test-id") {
                  ... on Issue {
                    ...IssueSidebarPrimaryQuery
                  }
                }
                viewer {
                  ...IssueViewerViewer
                }
              }
            `,
            variables: {},
          },
          lazySidebarQuery: {
            type: 'lazy',
          },
        },
        mockResolvers: {
          Issue() {
            return {
              viewerCanType,
            }
          },
          Repository() {
            return {
              issueTypes: [
                {
                  name: 'Bug',
                },
              ],
            }
          },
          Project() {
            // a bit hacky, but needed to not get a coalition error
            return {
              name: 'test',
              title: 'test',
            }
          },
        },
      },
    },
  )
}

describe('rendering', () => {
  test('renders metadata for issue viewer for a logged in user', () => {
    renderTestComponent()

    expect(screen.getByText('Assignees')).toBeInTheDocument()
    expect(screen.getByText('Labels')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Milestone')).toBeInTheDocument()
    expect(screen.getByText('Development')).toBeInTheDocument()
  })

  test('renders metadata for issue viewer for a logged out users', () => {
    renderTestComponent({withViewer: false})

    expect(screen.getByText('Assignees')).toBeInTheDocument()
    expect(screen.getByText('Labels')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Milestone')).toBeInTheDocument()
    expect(screen.getByText('Development')).toBeInTheDocument()
  })

  test('does not render the Notifications section for a logged out user', () => {
    renderTestComponent({withViewer: false})

    expect(screen.queryByText('Notifications')).not.toBeInTheDocument()
  })

  test('does render the Notifications section for a logged in user', () => {
    renderTestComponent({withViewer: true})

    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  test('does not render issue type button if viewer cannot type', () => {
    renderTestComponent({viewerCanType: false})

    expect(screen.queryByText('Change issue type')).not.toBeInTheDocument()
  })

  test('renders issue type button if viewer can type', () => {
    renderTestComponent({viewerCanType: true})

    expect(screen.getByText('Change issue type')).toBeInTheDocument()
  })
})

describe('hotkeys', () => {
  test('opening issue type dialog', async () => {
    const user = setupUserEvent()
    renderTestComponent()

    expect(screen.queryByText(BUTTON_LABELS.changeType)).not.toBeInTheDocument()

    await user.keyboard('t')

    expect(screen.getByText(BUTTON_LABELS.changeType)).toBeInTheDocument()
  })
})
