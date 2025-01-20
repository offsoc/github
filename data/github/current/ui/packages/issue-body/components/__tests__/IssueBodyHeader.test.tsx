import {selectQuoteFromComment} from '@github-ui/commenting/quotes'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {renderRelay} from '@github-ui/relay-test-utils'
import {act, screen} from '@testing-library/react'
import {graphql} from 'relay-runtime'

import {IssueBodyHeader} from '../IssueBodyHeader'
import type {IssueBodyHeaderActionsProps} from '../IssueBodyHeaderActions'
import type {IssueBodyHeaderTestQuery} from './__generated__/IssueBodyHeaderTestQuery.graphql'

jest.mock('@github-ui/commenting/quotes', () => ({
  selectQuoteFromComment: jest.fn(),
}))

const url = '/github/issues/33#issue-33'

const setup = (actionProps?: IssueBodyHeaderActionsProps) => {
  const {relayMockEnvironment} = renderRelay<{issueBodyHeader: IssueBodyHeaderTestQuery}>(
    ({queryData}) => (
      <IssueBodyHeader comment={queryData.issueBodyHeader.repository!.issue!} url={url} actionProps={actionProps} />
    ),
    {
      relay: {
        queries: {
          issueBodyHeader: {
            type: 'fragment',
            query: graphql`
              query IssueBodyHeaderTestQuery @relay_test_operation {
                repository(owner: "owner", name: "repo") {
                  issue(number: 33) {
                    ...IssueBodyHeader
                  }
                }
              }
            `,
            variables: {},
          },
        },
        mockResolvers: {
          Issue() {
            return {
              createdAt: '2021-08-19T17:25:19Z',
              viewerDidAuthor: false,
              body: 'This is the body of the issue',
            }
          },
        },
      },
      wrapper: Wrapper,
    },
  )

  return relayMockEnvironment
}

describe('Quote reply', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Renders the quote reply action', async () => {
    const onReplySelectMock = jest.fn()

    const actionProps = {
      startIssueBodyEdit: () => {},
      viewerCanUpdate: true,
      viewerCanReport: false,
      author: null,
      onReplySelect: onReplySelectMock,
    }

    setup(actionProps)

    const issueBodyMenuButton = screen.getByRole('button', {name: 'Issue body actions'})
    expect(issueBodyMenuButton).toBeInTheDocument()
    act(() => {
      issueBodyMenuButton.click()
    })

    const reportContentButton = screen.queryByText('Report content')
    expect(reportContentButton).not.toBeInTheDocument()

    const quoteReplyButton = screen.getByText('Quote reply')
    expect(quoteReplyButton).toBeInTheDocument()
    act(() => {
      quoteReplyButton.click()
    })

    expect(onReplySelectMock).toHaveBeenCalledTimes(1)
  })

  it('calls the quote helper with the store data', async () => {
    const div = document.createElement('div')
    const actionProps = {
      startIssueBodyEdit: () => {},
      viewerCanUpdate: true,
      viewerCanReport: false,
      issueBodyRef: {current: div},
    }

    setup(actionProps)

    const issueBodyMenuButton = screen.getByRole('button', {name: 'Issue body actions'})
    act(() => {
      issueBodyMenuButton.click()
    })

    const quoteReplyButton = screen.getByText('Quote reply')
    act(() => {
      quoteReplyButton.click()
    })

    expect(selectQuoteFromComment).toHaveBeenCalledWith(div, null, 'This is the body of the issue')
  })
})

it('Renders the report action', async () => {
  const onReplySelectMock = jest.fn()

  const actionProps = {
    startIssueBodyEdit: () => {},
    viewerCanUpdate: true,
    viewerCanReport: true,
    author: null,
    onReplySelect: onReplySelectMock,
  }

  setup(actionProps)

  const issueBodyMenuButton = screen.getByRole('button', {name: 'Issue body actions'})
  expect(issueBodyMenuButton).toBeInTheDocument()
  act(() => {
    issueBodyMenuButton.click()
  })

  const reportContentButton = screen.getByText('Report content')
  expect(reportContentButton).toBeInTheDocument()
})

it('Renders the deeplink url', async () => {
  setup()

  const issueBodyHeaderUrl = screen.getByTestId('issue-body-header-link')
  expect(issueBodyHeaderUrl).toBeInTheDocument()
  expect(issueBodyHeaderUrl).toHaveAttribute('href', url)
})
