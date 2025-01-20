import {renderRelay} from '@github-ui/relay-test-utils'
import {graphql} from 'relay-runtime'
import type {HeaderIssueTypeTestQuery} from './__generated__/HeaderIssueTypeTestQuery.graphql'
import {HeaderIssueType, SmallHeaderIssueType} from '../HeaderIssueType'
import {screen} from '@testing-library/react'
import type {RelayMockProps} from '@github-ui/relay-test-utils/RelayTestFactories'

type HeaderIssueTypeQueries = {
  headerIssueType: HeaderIssueTypeTestQuery
}
const baseRelayMock: RelayMockProps<HeaderIssueTypeQueries> = {
  queries: {
    headerIssueType: {
      type: 'fragment',
      query: graphql`
        query HeaderIssueTypeTestQuery($id: ID!) @relay_test_operation {
          node(id: $id) {
            ... on Issue {
              ...HeaderIssueType
            }
          }
        }
      `,
      variables: {
        id: 'issue_id',
      },
    },
  },
}

describe('HeaderIssueType', () => {
  test('render', () => {
    renderRelay<{headerIssueType: HeaderIssueTypeTestQuery}>(
      ({queryData}) => <HeaderIssueType data={queryData.headerIssueType.node!} />,
      {
        relay: {
          ...baseRelayMock,
          mockResolvers: {
            Issue: () => ({
              viewerCanSeeIssueType: true,
              issueType: {
                name: 'Issue type',
              },
            }),
          },
        },
      },
    )

    expect(screen.getByText('Issue type')).toBeInTheDocument()
  })

  test("does not render if there's no issueType", () => {
    const {container} = renderRelay<{headerIssueType: HeaderIssueTypeTestQuery}>(
      ({queryData}) => <HeaderIssueType data={queryData.headerIssueType.node!} />,
      {
        relay: {
          ...baseRelayMock,
          mockResolvers: {
            Issue: () => ({
              viewerCanSeeIssueType: true,
              issueType: null,
            }),
          },
        },
      },
    )

    expect(container).toBeEmptyDOMElement()
  })
})

describe('SmallHeaderIssueType', () => {
  test('render', () => {
    renderRelay<{headerIssueType: HeaderIssueTypeTestQuery}>(
      ({queryData}) => <SmallHeaderIssueType data={queryData.headerIssueType.node!} />,
      {
        relay: {
          ...baseRelayMock,
          mockResolvers: {
            Issue: () => ({
              viewerCanSeeIssueType: true,
              issueType: {
                name: 'Issue type',
              },
            }),
          },
        },
      },
    )

    expect(screen.getByText('Issue type')).toBeInTheDocument()
  })

  test("does not render if there's no issueType", () => {
    const {container} = renderRelay<{headerIssueType: HeaderIssueTypeTestQuery}>(
      ({queryData}) => <SmallHeaderIssueType data={queryData.headerIssueType.node!} />,
      {
        relay: {
          ...baseRelayMock,
          mockResolvers: {
            Issue: () => ({
              viewerCanSeeIssueType: true,
              issueType: null,
            }),
          },
        },
      },
    )

    expect(container).toBeEmptyDOMElement()
  })
})
