import {Wrapper} from '@github-ui/react-core/test-utils'
import {renderRelay} from '@github-ui/relay-test-utils'
import {screen} from '@testing-library/react'
import {graphql} from 'relay-runtime'

import {IssueBodyHeaderAuthor} from '../IssueBodyHeaderAuthor'
import type {IssueBodyHeaderAuthorTestQuery} from './__generated__/IssueBodyHeaderAuthorTestQuery.graphql'

const setup = (omitAuthor = false) => {
  const {relayMockEnvironment} = renderRelay<{issueBodyHeaderAuthor: IssueBodyHeaderAuthorTestQuery}>(
    ({queryData}) => (
      <IssueBodyHeaderAuthor
        author={queryData.issueBodyHeaderAuthor.repository!.issue!.author || null}
        showLogin={true}
      />
    ),
    {
      relay: {
        queries: {
          issueBodyHeaderAuthor: {
            type: 'fragment',
            query: graphql`
              query IssueBodyHeaderAuthorTestQuery @relay_test_operation {
                repository(owner: "owner", name: "repo") {
                  issue(number: 33) {
                    # eslint-disable-next-line relay/unused-fields
                    author {
                      ...IssueBodyHeaderAuthor
                    }
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
              author: omitAuthor ? null : {login: 'monalisa', avatarUrl: 'monalisa.png'},
            }
          },
        },
      },
      wrapper: Wrapper,
    },
  )

  return relayMockEnvironment
}

it('Renders the author if the author exists', async () => {
  setup()
  const author = screen.getByTestId('issue-body-header-author')
  expect(author).toHaveTextContent('monalisa')
})

it('Renders the ghost user if the author does not exist', async () => {
  setup(true)
  const author = screen.getByTestId('issue-body-header-author')
  expect(author).toHaveTextContent('ghost')
})
