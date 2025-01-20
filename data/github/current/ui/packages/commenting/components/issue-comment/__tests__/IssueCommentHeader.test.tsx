import {noop} from '@github-ui/noop'
import {render, Wrapper} from '@github-ui/react-core/test-utils'
import {renderRelay} from '@github-ui/relay-test-utils'
import {ComponentWithLazyLoadQuery} from '@github-ui/relay-test-utils/RelayComponents'
import {act, fireEvent, screen, waitFor, within} from '@testing-library/react'
import {type ComponentProps, Suspense} from 'react'
import {graphql, RelayEnvironmentProvider} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {LABELS} from '../../../constants/labels'
import {TEST_IDS} from '../../../constants/test-ids'
import {makeIssueCommentBaseTypes} from '../../../test-utils/relay-type-mocks'
import {selectQuoteFromComment} from '../../../utils/quotes'
import type {IssueCommentHeader$data, IssueCommentHeader$key} from '../__generated__/IssueCommentHeader.graphql'
import type {IssueCommentViewerCommentRow$data} from '../__generated__/IssueCommentViewerCommentRow.graphql'
import {IssueCommentHeader, type IssueCommentHeaderProps} from '../IssueCommentHeader'
import type {IssueCommentHeaderTestQuery} from './__generated__/IssueCommentHeaderTestQuery.graphql'

jest.setTimeout(5000)

jest.mock('../../../utils/quotes', () => ({
  selectQuoteFromComment: jest.fn(),
}))

type TestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
} & Partial<Omit<ComponentProps<typeof IssueCommentHeader>, 'comment'>>

const owner = 'owner'
const repo = 'repo'
const number = 10

const urlParams = {
  owner,
  repo,
  number,
}

const defaultProps = {
  commentAuthorLogin: '',
  editComment: noop,
  onReplySelect: noop,
  navigate: noop,
  isMinimized: false,
}

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')

  return {
    ...originalModule,
    useParams: () => urlParams,
  }
})

function editCommentStub() {}

const setup = (
  issueComment: Partial<(IssueCommentViewerCommentRow$data | IssueCommentHeader$data) & {isPrivate: boolean}>,
  overrideProps: Partial<IssueCommentHeaderProps> = {},
) => {
  const {relayMockEnvironment} = renderRelay<{issueCommentHeader: IssueCommentHeaderTestQuery}>(
    ({queryData}) => (
      <IssueCommentHeader
        comment={
          queryData.issueCommentHeader.repository?.issue?.timelineItems.edges![0]
            ?.node as IssueCommentHeaderProps['comment']
        }
        {...defaultProps}
        {...overrideProps}
        avatarUrl={'https://avatars.githubusercontent.com/u/123456?v=4'}
      />
    ),
    {
      relay: {
        queries: {
          issueCommentHeader: {
            type: 'fragment',
            query: graphql`
              query IssueCommentHeaderTestQuery @relay_test_operation {
                repository(owner: "owner", name: "repo") {
                  issue(number: 33) {
                    timelineItems(last: 10, before: null) {
                      edges {
                        node {
                          __typename
                          ... on IssueComment {
                            ...IssueCommentHeader
                          }
                        }
                      }
                    }
                  }
                }
              }
            `,
            variables: {},
          },
        },
        mockResolvers: {
          ...makeIssueCommentBaseTypes(),
          IssueComment() {
            return {...issueComment}
          },
          Repository() {
            !!issueComment.isPrivate
          },
        },
      },
      wrapper: Wrapper,
    },
  )

  return relayMockEnvironment
}

function TestComponent({environment, ...componentProps}: TestComponentProps) {
  const propsWithDefault = {
    ...defaultProps,
    ...componentProps,
  }

  const query = graphql`
    query IssueCommentHeaderNodeTestQuery($commentId: ID!) @relay_test_operation {
      comment: node(id: $commentId) {
        ... on Comment {
          ...IssueCommentHeader
        }
      }
    }
  `
  const queryVariables = {
    commentId: 'IC_kwAEAg',
  }
  const createComponent = (data: unknown) => (
    <IssueCommentHeader
      comment={(data as {comment: IssueCommentHeader$key}).comment}
      {...propsWithDefault}
      avatarUrl={'https://avatars.githubusercontent.com/u/123456?v=4'}
    />
  )
  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="...Loading">
        <ComponentWithLazyLoadQuery dataToComponent={createComponent} query={query} queryVariables={queryVariables} />
      </Suspense>
    </RelayEnvironmentProvider>
  )
}

it('Renders Collaborator label for public repo', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} editComment={editCommentStub} />)
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        ...makeIssueCommentBaseTypes(),
        IssueComment() {
          return {
            isPrivate: false,
            authorAssociation: 'COLLABORATOR',
            authorToRepoOwnerSponsorship: null,
          }
        },
        Repository() {
          return {isPrivate: false, name: 'owl', owner: {login: 'bird'}}
        },
      })
    })
  })
  const headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)

  expect(within(headerDiv).queryByText(/sent via email/i)).not.toBeInTheDocument()

  const authorAssociation = within(headerDiv).getByTestId(TEST_IDS.commentAuthorAssociation)

  within(authorAssociation).queryByText('Collaborator')
  expect(await screen.findByTestId(TEST_IDS.avatarLink)).not.toHaveStyle('color: rgb(101, 109, 118)') // not fg.muted when comment is not hidden

  const tooltip = screen.getByTestId(TEST_IDS.commentAuthorAssociation)
  expect(tooltip.getAttribute('aria-label')).toBe('You have been invited to collaborate on the bird repository.')
})

it('Renders comment subject author label for public repo', async () => {
  const environment = createMockEnvironment()
  render(
    <TestComponent
      environment={environment}
      editComment={editCommentStub}
      commentSubjectAuthorLogin={'issue_author'}
      commentAuthorLogin={'issue_author'}
    />,
  )
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        ...makeIssueCommentBaseTypes(),
        IssueComment() {
          return {
            isPrivate: false,
            authorToRepoOwnerSponsorship: null,
          }
        },
      })
    })
  })
  const headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)

  const commentSubjectAuthor = within(headerDiv).getByTestId(TEST_IDS.commentSubjectAuthor)
  within(commentSubjectAuthor).queryByText('Author')

  const tooltips = screen.getByRole('tooltip')
  expect(tooltips.getAttribute('aria-label')).toBe('You are the author of this comment')
})

it('Renders header in a different color when the viewer is the author', async () => {
  const environment = createMockEnvironment()
  render(
    <TestComponent
      environment={environment}
      editComment={editCommentStub}
      commentSubjectAuthorLogin={'issue_author'}
      commentAuthorLogin={'issue_author'}
    />,
  )
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        ...makeIssueCommentBaseTypes(),
        IssueComment() {
          return {
            isPrivate: false,
            authorToRepoOwnerSponsorship: null,
          }
        },
      })
    })
  })

  const headerDiv = await screen.findByTestId(TEST_IDS.commentHeader)
  expect(headerDiv).toHaveStyle('background-color: var(--bgColor-muted,var(--color-canvas-subtle,#f6f8fa))')
})

it('Renders created by email label', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} editComment={editCommentStub} />)
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        ...makeIssueCommentBaseTypes(),
        IssueComment() {
          return {
            isPrivate: false,
            createdViaEmail: true,
            authorToRepoOwnerSponsorship: null,
          }
        },
      })
    })
  })
  const headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)
  const byEmailLabel = within(headerDiv).getByText(/sent via email/i)
  expect(byEmailLabel).toBeInTheDocument()
})

it('Renders sponsor label', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} editComment={editCommentStub} />)
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        ...makeIssueCommentBaseTypes(),
        IssueComment() {
          return {
            isPrivate: false,
            authorToRepoOwnerSponsorship: {
              isActive: true,
              createdAt: '2021-03-05T00:00:00Z',
            },
          }
        },
        Repository() {
          return {isPrivate: false, name: 'owl', owner: {login: 'bird'}}
        },
      })
    })
  })
  const headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)
  expect(headerDiv).toBeInTheDocument()

  const sponsorLabel = within(headerDiv).getByTestId(TEST_IDS.sponsorLabel)
  expect(sponsorLabel).toBeInTheDocument()

  const tooltips = screen.getAllByRole('tooltip')
  expect(tooltips.length).toBe(2)
  expect(tooltips.find(t => t.getAttribute('aria-label') === "bird's sponsor since March 2021")).toBeInTheDocument()
})

it('Renders hidden comments as minimized with reason, shows unminimize button when viewer has access', async () => {
  const reason = 'OFF_TOPIC'
  const environment = createMockEnvironment()
  let clickCount = 0

  render(
    <TestComponent
      environment={environment}
      editComment={editCommentStub}
      isMinimized={true}
      onMinimize={() => clickCount++}
    />,
  )
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        ...makeIssueCommentBaseTypes(),
        IssueComment() {
          return {
            isPrivate: false,
            authorAssociation: 'COLLABORATOR',
            isHidden: true,
            isMinimized: true,
            minimizedReason: reason,
            viewerCanSeeUnminimizeButton: true,
          }
        },
      })
    })
  })

  const headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)
  expect(
    within(headerDiv).getByText(`${LABELS.hiddenCommentWithReason} ${reason.replace(/_/g, '-').toLowerCase()}`),
  ).toBeInTheDocument()

  expect(await screen.findByTestId(TEST_IDS.avatarLink)).toHaveStyle(
    'color: var(--fgColor-muted,var(--color-fg-muted,#656d76))',
  ) // fg.muted when comment is minimized
  const unminimizeButton = await screen.findByLabelText('show comment')
  expect(unminimizeButton).toBeInTheDocument()

  await act(async () => {
    unminimizeButton.click()
  })

  expect(clickCount).toBeGreaterThan(0)
})

it('Renders hidden comments as minimized with reason', async () => {
  const reason = 'OFF_TOPIC'
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} editComment={editCommentStub} isMinimized={true} />)
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        ...makeIssueCommentBaseTypes(),
        IssueComment() {
          return {
            isPrivate: false,
            authorAssociation: 'COLLABORATOR',
            isHidden: true,
            isMinimized: true,
            minimizedReason: reason,
            viewerCanSeeUnminimizeButton: false,
          }
        },
      })
    })
  })
  const headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)
  expect(
    within(headerDiv).getByText(`${LABELS.hiddenCommentWithReason} ${reason.replace(/_/g, '-').toLowerCase()}`),
  ).toBeInTheDocument()

  expect(await screen.findByTestId(TEST_IDS.avatarLink)).toHaveStyle(
    'color: var(--fgColor-muted,var(--color-fg-muted,#656d76))',
  ) // fg.muted when comment is minimized
  expect(screen.getByLabelText('show comment')).toBeInTheDocument()
})

it('Renders hidden comments as expanded if isMinimized=false shows minimize button when viewer has access', async () => {
  const reason = 'OFF_TOPIC'
  const environment = createMockEnvironment()
  let clickCount = 0

  render(
    <TestComponent
      environment={environment}
      editComment={editCommentStub}
      isMinimized={false}
      onMinimize={() => clickCount++}
    />,
  )
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        ...makeIssueCommentBaseTypes(),
        IssueComment() {
          return {
            isPrivate: false,
            authorAssociation: 'COLLABORATOR',
            isHidden: true,
            isMinimized: false,
            minimizedReason: reason,
            viewerCanSeeUnminimizeButton: true,
          }
        },
      })
    })
  })
  const headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)
  expect(
    within(headerDiv).getByText(`${LABELS.hiddenCommentWithReason} ${reason.replace(/_/g, '-').toLowerCase()}`),
  ).toBeInTheDocument()

  expect(await screen.findByTestId(TEST_IDS.avatarLink)).toHaveStyle(
    'color: var(--fgColor-muted,var(--color-fg-muted,#656d76))',
  ) // fg.muted also when comment is expanded
  const minimizeButton = await screen.findByLabelText('hide comment')
  expect(minimizeButton).toBeInTheDocument()

  await act(async () => {
    minimizeButton.click()
  })

  expect(clickCount).toBeGreaterThan(0)
})

it('Renders hidden comments as expanded if isMinimized=false', async () => {
  const reason = 'OFF_TOPIC'
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} editComment={editCommentStub} isMinimized={false} />)
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        ...makeIssueCommentBaseTypes(),
        IssueComment() {
          return {
            isPrivate: false,
            authorAssociation: 'COLLABORATOR',
            isHidden: true,
            isMinimized: false,
            minimizedReason: reason,
            viewerCanSeeMinimizeButton: false,
          }
        },
      })
    })
  })
  const headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)
  expect(
    within(headerDiv).getByText(`${LABELS.hiddenCommentWithReason} ${reason.replace(/_/g, '-').toLowerCase()}`),
  ).toBeInTheDocument()

  expect(await screen.findByTestId(TEST_IDS.avatarLink)).toHaveStyle(
    'color: var(--fgColor-muted,var(--color-fg-muted,#656d76))',
  ) // fg.muted even when hidden comment is shown
  const minimizeButton = screen.queryByLabelText('hide comment')
  expect(minimizeButton).toBeInTheDocument()
})

describe('Comment replies', () => {
  it('onReplySelect is triggered when reply button is clicked', async () => {
    const environment = createMockEnvironment()
    const onReplySelectMock = jest.fn()

    render(<TestComponent environment={environment} onReplySelect={onReplySelectMock} />)
    await act(async () =>
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          ...makeIssueCommentBaseTypes(),
          IssueComment() {
            return {
              isPrivate: false,
              authorAssociation: 'COLLABORATOR',
            }
          },
        }),
      ),
    )

    const commentAction = screen.getByLabelText('Comment actions')
    expect(commentAction).toBeInTheDocument()

    fireEvent.click(commentAction)

    const quoteReplyAction = screen.getByText('Quote reply')
    expect(quoteReplyAction).toBeInTheDocument()
    fireEvent.click(quoteReplyAction)

    expect(onReplySelectMock).toHaveBeenCalledTimes(1)
  })

  it('calls the quote helper with the store data', async () => {
    const environment = createMockEnvironment()
    const div = document.createElement('div')
    const ref = {current: div}
    const data = {data: 'data'}

    render(<TestComponent environment={environment} commentRef={ref} />)
    await act(async () =>
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          ...makeIssueCommentBaseTypes(),
          IssueComment() {
            return {
              isPrivate: false,
              authorAssociation: 'COLLABORATOR',
              body: data,
            }
          },
        }),
      ),
    )

    const commentAction = screen.getByLabelText('Comment actions')
    expect(commentAction).toBeInTheDocument()

    fireEvent.click(commentAction)

    const quoteReplyAction = screen.getByText('Quote reply')
    expect(quoteReplyAction).toBeInTheDocument()
    fireEvent.click(quoteReplyAction)

    expect(selectQuoteFromComment).toHaveBeenCalledWith(div, null, data)
  })
})

it('Does not render label for private repo', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} editComment={editCommentStub} />)
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        ...makeIssueCommentBaseTypes(),
        IssueComment() {
          return {
            isPrivate: false,
            authorAssociation: 'COLLABORATOR',
          }
        },
      })
    })
  })
  const headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)

  expect(within(headerDiv).queryByTestId(TEST_IDS.commentAuthorAssociation)).toBeNull()
  expect(within(headerDiv).queryByText('Collaborator')).toBeNull()
})

it('Does not allow edits when viewer can update is false', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} editComment={editCommentStub} />)
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        ...makeIssueCommentBaseTypes(),
        IssueComment() {
          return {
            isPrivate: true,
            authorAssociation: 'COLLABORATOR',
            viewerCanUpdate: false,
          }
        },
      })
    })
  })
  const headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)
  const hamburger = await waitFor(() => within(headerDiv).getByTestId(TEST_IDS.commentHeaderHamburger))
  fireEvent.click(hamburger)

  const menu = await screen.findByTestId(TEST_IDS.commentHeaderHamburgerOpen)
  expect(within(menu).queryByText('Edit')).not.toBeInTheDocument()
})

it('Does not allow hiding when viewer can minimize is false', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} editComment={editCommentStub} />)
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        ...makeIssueCommentBaseTypes(),
        IssueComment() {
          return {
            isPrivate: true,
            authorAssociation: 'COLLABORATOR',
            viewerCanMinimize: false,
          }
        },
      })
    })
  })
  const headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)
  const hamburger = await waitFor(() => within(headerDiv).getByTestId(TEST_IDS.commentHeaderHamburger))
  fireEvent.click(hamburger)

  const menu = await screen.findByTestId(TEST_IDS.commentHeaderHamburgerOpen)
  expect(within(menu).queryByText('Hide')).not.toBeInTheDocument()
})

it('Does not allow deletion when viewer can delete is false', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} editComment={editCommentStub} />)
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        ...makeIssueCommentBaseTypes(),
        IssueComment() {
          return {
            isPrivate: true,
            authorAssociation: 'COLLABORATOR',
            viewerCanUpdate: false,
            viewerCanDelete: false,
          }
        },
      })
    })
  })
  const headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)
  const hamburger = await waitFor(() => within(headerDiv).getByTestId(TEST_IDS.commentHeaderHamburger))
  fireEvent.click(hamburger)

  const menu = await screen.findByTestId(TEST_IDS.commentHeaderHamburgerOpen)
  expect(within(menu).queryByText('Delete')).not.toBeInTheDocument()
})

it('Allow edits when viewer can update is true', async () => {
  const environment = createMockEnvironment()

  const clicked = {clicked: false}
  const editClicked = () => {
    clicked.clicked = true
  }
  render(<TestComponent environment={environment} editComment={editClicked} />)
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        ...makeIssueCommentBaseTypes(),
        IssueComment() {
          return {
            isPrivate: true,
            authorAssociation: 'NONE',
            viewerCanUpdate: true,
          }
        },
      })
    })
  })
  const headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)
  const hamburger = await waitFor(() => within(headerDiv).getByTestId(TEST_IDS.commentHeaderHamburger))
  fireEvent.click(hamburger)

  // menu shows the edit button
  const menu = await screen.findByTestId(TEST_IDS.commentHeaderHamburgerOpen)
  const edit = within(menu).queryByText('Edit')
  expect(edit).toBeInTheDocument()

  // clicking edit button triggers editComment
  fireEvent.click(edit!)
  expect(clicked.clicked).toBe(true)
})

it('Allow hiding and unhiding when viewer can update is true', async () => {
  const environment = setup({
    id: 'IC_kwAEAg',
    isPrivate: true,
    authorAssociation: 'NONE',
    viewerCanMinimize: true,
  })

  let headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)
  let hamburger = await waitFor(() => within(headerDiv).getByTestId(TEST_IDS.commentHeaderHamburger))
  fireEvent.click(hamburger)

  // menu shows the hide button
  let menu = await screen.findByTestId(TEST_IDS.commentHeaderHamburgerOpen)
  let hide = within(menu).queryByText('Hide')
  expect(hide).toBeInTheDocument()

  // open the hide menu and assert
  fireEvent.click(hide!)
  const spam = await screen.findByText('Spam')
  expect(spam).toBeInTheDocument()
  expect(await screen.findByText('Abuse')).toBeInTheDocument()
  expect(await screen.findByText('Off-topic')).toBeInTheDocument()
  expect(await screen.findByText('Outdated')).toBeInTheDocument()
  expect(await screen.findByText('Duplicate')).toBeInTheDocument()
  expect(await screen.findByText('Resolved')).toBeInTheDocument()

  fireEvent.click(spam)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        MinimizeCommentPayload() {
          return {
            clientMutationId: null,
            minimizedComment: {
              __typename: 'IssueComment',
              isMinimized: true,
              minimizedReason: 'spam',
              __isNode: 'IssueComment',
              id: 'IC_kwAEAg',
            },
          }
        },
      })
    })
  })

  // make sure menus are closed
  let no_menu = screen.queryByTestId(TEST_IDS.commentHeaderHamburgerOpen)
  expect(no_menu).not.toBeInTheDocument()
  expect(screen.queryByText('Abuse')).not.toBeInTheDocument()

  // open menu again
  headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)
  hamburger = await waitFor(() => within(headerDiv).getByTestId(TEST_IDS.commentHeaderHamburger))
  fireEvent.click(hamburger)

  // menu shows the unhide button
  menu = await screen.findByTestId(TEST_IDS.commentHeaderHamburgerOpen)
  const unhide = within(menu).queryByText('Unhide')
  expect(unhide).toBeInTheDocument()

  // Click unhide
  fireEvent.click(unhide!)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        UnminimizeCommentPayload() {
          return {
            clientMutationId: null,
            unminimizedComment: {
              __typename: 'IssueComment',
              isMinimized: false,
              minimizedReason: null,
              __isNode: 'IssueComment',
              id: 'IC_kwAEAg',
            },
          }
        },
      })
    })
  })

  // make sure menus are closed
  no_menu = screen.queryByTestId(TEST_IDS.commentHeaderHamburgerOpen)
  expect(no_menu).not.toBeInTheDocument()
  expect(screen.queryByText('Abuse')).not.toBeInTheDocument()

  // open menu again
  headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)
  hamburger = await waitFor(() => within(headerDiv).getByTestId(TEST_IDS.commentHeaderHamburger))
  fireEvent.click(hamburger)

  // make sure hide is there again
  menu = await screen.findByTestId(TEST_IDS.commentHeaderHamburgerOpen)
  hide = within(menu).queryByText('Hide')
  expect(hide).toBeInTheDocument()
})

it('Allows deletion when viewer can delete is true', async () => {
  setup({
    isPrivate: true,
    authorAssociation: 'COLLABORATOR',
    viewerCanUpdate: true,
    viewerCanDelete: true,
  })

  const headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)
  const hamburger = await waitFor(() => within(headerDiv).getByTestId(TEST_IDS.commentHeaderHamburger))
  fireEvent.click(hamburger)

  const menu = await screen.findByTestId(TEST_IDS.commentHeaderHamburgerOpen)
  const deleteComment = within(menu).queryByText('Delete')
  expect(deleteComment).toBeInTheDocument()

  // clicking delete button triggers deleteComment
  // the primer confirmation modal generates a warning message that jest fails on
  jest.spyOn(console, 'error').mockImplementation()
  fireEvent.click(deleteComment!)

  const confirmButton = screen.queryAllByRole('button', {name: 'Delete'})
  expect(confirmButton).toHaveLength(1)
  expect(confirmButton[0]).toBeInTheDocument()
})

it('Allows reporting content when viewerCanReport is true', async () => {
  setup({
    isPrivate: false,
    authorAssociation: 'COLLABORATOR',
    viewerCanReport: true,
    viewerCanReportToMaintainer: false,
  })
  const headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)
  const hamburger = await waitFor(() => within(headerDiv).getByTestId(TEST_IDS.commentHeaderHamburger))
  fireEvent.click(hamburger)

  const menu = await screen.findByTestId(TEST_IDS.commentHeaderHamburgerOpen)
  const reportContent = within(menu).queryByText('Report content')
  expect(reportContent).toBeInTheDocument()
})

it('Allows reporting content to repo admins when viewerCanReportToMaintainer is true, default reason', async () => {
  const environment = setup({
    id: 'IC_kwAEAg',
    isPrivate: false,
    authorAssociation: 'COLLABORATOR',
    viewerCanReport: true,
    viewerCanReportToMaintainer: true,
  })
  const headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)
  const hamburger = await waitFor(() => within(headerDiv).getByTestId(TEST_IDS.commentHeaderHamburger))
  fireEvent.click(hamburger)

  const menu = await screen.findByTestId(TEST_IDS.commentHeaderHamburgerOpen)
  const reportContent = await waitFor(() => within(menu).queryByText('Report content'))
  expect(reportContent).toBeInTheDocument()

  fireEvent.click(reportContent!)

  const dialog = await screen.findByRole('dialog')
  const reportToRepoAdmins = await waitFor(() => within(dialog).queryByText('Report to repository admins'))

  fireEvent.click(reportToRepoAdmins!)

  const mutationName = environment.mock.getMostRecentOperation().fragment.node.name
  const reason = environment.mock.getMostRecentOperation().fragment.variables.input.reason
  const contentId = environment.mock.getMostRecentOperation().fragment.variables.input.reportedContent

  expect(mutationName).toBe('submitAbuseReportMutation')
  expect(reason).toBe('UNSPECIFIED')
  expect(contentId).toBe('IC_kwAEAg')
})

it('Allows reporting content to repo admins when viewerCanReportToMaintainer is true, explicit reason', async () => {
  const environment = setup({
    id: 'IC_kwAEAg',
    isPrivate: false,
    authorAssociation: 'COLLABORATOR',
    viewerCanReport: true,
    viewerCanReportToMaintainer: true,
  })
  const headerDiv = await screen.findByTestId(TEST_IDS.commentHeaderRightSideItems)
  const hamburger = await waitFor(() => within(headerDiv).getByTestId(TEST_IDS.commentHeaderHamburger))
  fireEvent.click(hamburger)

  const menu = await screen.findByTestId(TEST_IDS.commentHeaderHamburgerOpen)
  const reportContent = await waitFor(() => within(menu).queryByText('Report content'))
  expect(reportContent).toBeInTheDocument()

  fireEvent.click(reportContent!)

  const dialog = await screen.findByRole('dialog')

  const reasonButton = await waitFor(() => within(dialog).queryByText('Choose a reason'))
  fireEvent.click(reasonButton!)
  const spam = await screen.findByText('Spam')
  fireEvent.click(spam)

  const reportToRepoAdmins = await waitFor(() => within(dialog).queryByText('Report to repository admins'))

  fireEvent.click(reportToRepoAdmins!)

  const mutationName = environment.mock.getMostRecentOperation().fragment.node.name
  const reason = environment.mock.getMostRecentOperation().fragment.variables.input.reason
  const contentId = environment.mock.getMostRecentOperation().fragment.variables.input.reportedContent

  expect(mutationName).toBe('submitAbuseReportMutation')
  expect(reason).toBe('SPAM')
  expect(contentId).toBe('IC_kwAEAg')
})

it('renders correct link of author if user is a bot', async () => {
  setup(
    {
      id: 'IC_kwAEAg',
    },
    {commentAuthorType: 'Bot', commentAuthorLogin: 'user_login'},
  )

  const authorLink = await screen.findByTestId(TEST_IDS.avatarLink)
  expect(authorLink).toHaveAttribute('href', '/apps/user_login')
})

it('renders correct link of author if user is not a bot', async () => {
  setup(
    {
      id: 'IC_kwAEAg',
    },
    {commentAuthorType: 'User', commentAuthorLogin: 'user_login'},
  )

  const authorLink = await screen.findByTestId(TEST_IDS.avatarLink)
  expect(authorLink).toHaveAttribute('href', '/user_login')
})
