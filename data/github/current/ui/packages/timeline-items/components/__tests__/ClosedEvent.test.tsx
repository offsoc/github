import {graphql} from 'relay-runtime'
import {renderRelay} from '@github-ui/relay-test-utils'
import {screen} from '@testing-library/react'
import {ClosedEvent} from '../ClosedEvent'
import type {ClosedEventTestQuery} from './__generated__/ClosedEventTestQuery.graphql'

test('Renders auto-close workflow closed issue event', () => {
  renderRelay<{query: ClosedEventTestQuery}>(
    ({queryData}) => (
      <ClosedEvent queryRef={queryData.query.node!} timelineEventBaseUrl="timelinetest" issueUrl="test" />
    ),
    {
      relay: {
        queries: {
          query: {
            type: 'fragment',
            query: graphql`
              query ClosedEventTestQuery @relay_test_operation {
                node(id: "node-id") {
                  ... on ClosedEvent {
                    ...ClosedEvent
                  }
                }
              }
            `,
            variables: {},
          },
        },
        mockResolvers: {
          Node() {
            return {
              createdAt: '2024-01-01T00:00:00Z',
              closer: {
                __typename: 'ProjectV2',
                title: 'monalisa-project',
                url: 'monalisa-project-url',
              },
              closingProjectItemStatus: 'Done',
            }
          },
        },
      },
    },
  )

  expect(screen.getByTestId('closer-link')).toHaveAttribute('href', 'monalisa-project-url')
  expect(screen.getByTestId('closer-link')).toHaveTextContent('monalisa-project')
})
