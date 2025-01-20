import {noop} from '@github-ui/noop'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {renderRelay} from '@github-ui/relay-test-utils'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {SubIssueStateProvider} from '@github-ui/sub-issues/SubIssueStateContext'
import {act, fireEvent, screen} from '@testing-library/react'
import {useRef} from 'react'
import {graphql} from 'relay-runtime'

import {commitCreateIssueFromChecklistItemMutation} from '../../mutations/create-issue-from-checklist-item-mutation'
import {IssueBodyViewer, type IssueBodyViewerProps} from '../IssueBodyViewer'
import type {IssueBodyViewerTestQuery} from './__generated__/IssueBodyViewerTestQuery.graphql'

const mockUseFeatureFlags = jest.fn().mockReturnValue({})
jest.mock('@github-ui/react-core/use-feature-flag', () => ({
  useFeatureFlags: () => mockUseFeatureFlags({}),
}))

beforeEach(() => {
  mockUseFeatureFlags.mockClear()
})

const Viewer = (props: Omit<IssueBodyViewerProps, 'viewerRef'>) => {
  const viewerRef = useRef<HTMLDivElement>(null)

  return <IssueBodyViewer {...props} viewerRef={viewerRef} />
}

describe('tasklist button', () => {
  beforeAll(async () => {
    // preload the ReactionViewer component because it is lazily rendered inside IssueBodyViewer
    await import('@github-ui/reaction-viewer/ReactionViewer')
  })

  it('should render the tasklist button when viewer has update permissions and tasklist_block is enabled', async () => {
    setup({tasklist_block: true, viewerCanUpdate: true})
    await act(async () => {
      expect(screen.getByText(/Add tasklist/)).toBeInTheDocument()
    })
  })

  it('should not render the tasklist button when viewer has not update permissions and tasklist_block is enabled', () => {
    setup({tasklist_block: false, viewerCanUpdate: true})

    expect(screen.queryByText(/Add tasklist/)).not.toBeInTheDocument()
  })

  it('should not render the tasklist button when viewer has update permissions and tasklist_block is disabled', () => {
    setup({tasklist_block: true, viewerCanUpdate: false})

    expect(screen.queryByText(/Add tasklist/)).not.toBeInTheDocument()
  })
})

describe('sub-issues button', () => {
  beforeAll(async () => {
    // preload the ReactionViewer component because it is lazily rendered inside IssueBodyViewer
    await import('@github-ui/reaction-viewer/ReactionViewer')
  })

  it('should render the sub-issues button when viewer has update permissions for an issue in an unarchived repo with no sub-issues', async () => {
    setup({subIssues: {enabled: true}, viewerCanUpdate: true})
    await act(async () => {
      expect(screen.getByText(/Create sub-issue/)).toBeInTheDocument()
    })
  })

  it('should not render the sub-issues button when the sub_issues feature flag is disabled', () => {
    setup({viewerCanUpdate: true})

    expect(screen.queryByText(/Create sub-issue/)).not.toBeInTheDocument()
  })

  it('should not render the sub-issues button when the issue already has sub-issues', () => {
    setup({subIssues: {enabled: true, hasSubIssues: true}, viewerCanUpdate: true})

    expect(screen.queryByText(/Create sub-issue/)).not.toBeInTheDocument()
  })

  it('should not render the sub-issues button when viewer does not have update permissions', () => {
    setup({subIssues: {enabled: true}, viewerCanUpdate: false})

    expect(screen.queryByText(/Create sub-issue/)).not.toBeInTheDocument()
  })

  it('should not render the sub-issues button when the repo is archived', () => {
    setup({subIssues: {enabled: true, repoIsArchived: true}, viewerCanUpdate: true})

    expect(screen.queryByText(/Create sub-issue/)).not.toBeInTheDocument()
  })
})

jest.mock('../../mutations/create-issue-from-checklist-item-mutation')
const mockedConversionMutation = jest.mocked(commitCreateIssueFromChecklistItemMutation)
const mockedOnIssueEditStateChange = jest.fn()

describe('convert checklist item to issue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows the convert option and triggers the mutation when clicked', async () => {
    setup({
      html: `
        <ul class="contains-task-list">
          <li class="task-list-item"><input type="checkbox" id="" disabled="" class="task-list-item-checkbox"> A</li>
          <li class="task-list-item"><input type="checkbox" id="" disabled="" class="task-list-item-checkbox"> B</li>
        </ul>
      ` as SafeHTMLString,
      markdown: '- [ ] A\n- [ ] B',
      viewerCanUpdate: true,
      issues_react_checklist_improvements: true,
    })
    await act(async () => {
      expect(screen.getByTestId('tasklist-item-0-0')).toBeInTheDocument()
      expect(screen.getByTestId('tasklist-item-0-1')).toBeInTheDocument()
    })

    const menu = screen.getByTestId('tasklist-item-0-0-menu')
    fireEvent.click(menu)

    expect(screen.getByTestId('tasklist-item-0-0-menu-convert')).toBeInTheDocument()
    const convert = screen.getByTestId('tasklist-item-0-0-menu-convert')
    fireEvent.click(convert)

    expect(mockedConversionMutation).toHaveBeenCalledTimes(1)
  })

  it('does not show the convert option if the item is already converted', async () => {
    setup({
      html: `
        <ul class="contains-task-list">
          <li class="task-list-item"><
          <span class="reference"><svg aria-hidden="true" height="16" width="16" version="1.1" viewBox="0 0 16 16" title="Open" class="octicon octicon-issue-opened open mr-1"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path></svg><a href="https://github.com/test/test/issues/1" data-hovercard-url="/lemongrasss/mattamorphic-secret/issues/95/hovercard" data-hovercard-type="issue" data-url="https://github.com/test/test/issues/1" data-permission-text="Title is private" data-id="2346469517" data-error-text="Failed to load title" class="issue-link js-issue-link">thing 2<span class="issue-shorthand">&nbsp;#1</span></a></span>
          </li>
          <li class="task-list-item"><input type="checkbox" id="" disabled="" class="task-list-item-checkbox"> B</li>
        </ul>
      ` as SafeHTMLString,
      markdown: '- [ ] #1\n- [ ] B',
      viewerCanUpdate: true,
      issues_react_checklist_improvements: true,
    })
    await act(async () => {
      expect(screen.getByTestId('tasklist-item-0-0')).toBeInTheDocument()
      expect(screen.getByTestId('tasklist-item-0-1')).toBeInTheDocument()
    })

    const menu = screen.getByTestId('tasklist-item-0-0-menu')
    fireEvent.click(menu)

    expect(screen.queryByTestId('tasklist-item-0-0-menu-convert')).not.toBeInTheDocument()
    expect(mockedConversionMutation).toHaveBeenCalledTimes(0)
  })
})

const setup = ({
  html = 'html' as SafeHTMLString,
  markdown = 'markdown',
  viewerCanUpdate,
  isTransferInProgress = false,
  tasklist_block = false,
  issues_react_checklist_improvements = false,
  subIssues = {},
}: {
  html?: SafeHTMLString
  markdown?: string
  viewerCanUpdate: boolean
  isTransferInProgress?: boolean
  tasklist_block?: boolean
  issues_react_checklist_improvements?: boolean
  subIssues?: {
    enabled?: boolean
    hasSubIssues?: boolean
    repoIsArchived?: boolean
  }
}) => {
  mockUseFeatureFlags.mockReturnValue({
    tasklist_block,
    issues_react_checklist_improvements,
    sub_issues: subIssues.enabled,
  })

  renderRelay<{issuesShowQuery: IssueBodyViewerTestQuery}>(
    ({queryData}) => (
      <SubIssueStateProvider>
        <Viewer
          html={html}
          markdown={markdown}
          viewerCanUpdate={viewerCanUpdate}
          comment={queryData.issuesShowQuery.repository!.issue!}
          reactable={queryData.issuesShowQuery.repository!.issue!}
          onLinkClick={noop}
          locked={false}
          bodyVersion={'bodyVersion'}
          repositoryId={'R_1234'}
          onIssueEditStateChange={mockedOnIssueEditStateChange}
          subIssues={queryData.issuesShowQuery.repository!.issue}
        />
      </SubIssueStateProvider>
    ),
    {
      relay: {
        queries: {
          issuesShowQuery: {
            type: 'fragment',
            query: graphql`
              query IssueBodyViewerTestQuery @relay_test_operation {
                repository(owner: "owner", name: "repo") {
                  issue(number: 33) {
                    ...IssueBodyViewer
                    ...IssueBodyViewerReactable
                    ...IssueBodyViewerSubIssues
                  }
                }
              }
            `,
            variables: {},
          },
        },
        mockResolvers: {
          Issue(_ctx, id) {
            return {
              title: `My issue title ${id()}`,
              number: 33,
              subIssues: {
                nodes: subIssues.hasSubIssues
                  ? [
                      {
                        titleHTML: `Child 1`,
                        state: 'OPEN',
                      },
                      {
                        titleHTML: `Child 2`,
                        state: 'CLOSED',
                      },
                    ]
                  : [],
              },
              subIssuesConnection: {
                totalCount: subIssues.hasSubIssues ? 2 : 0,
              },
              viewerCanUpdateMetadata: viewerCanUpdate,
              isTransferInProgress,
              repository: {
                isArchived: subIssues.repoIsArchived,
              },
            }
          },
        },
      },
      wrapper: Wrapper,
    },
  )
}
