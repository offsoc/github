import {graphql} from 'relay-runtime'
import {renderRelay} from '@github-ui/relay-test-utils'
import {screen} from '@testing-library/react'
import {ProjectV2ItemStatusChangedEvent} from '../ProjectV2ItemStatusChangedEvent'
import type {ProjectV2ItemStatusChangedEventBotTestQuery} from './__generated__/ProjectV2ItemStatusChangedEventBotTestQuery.graphql'
import type {ProjectV2ItemStatusChangedEventUserTestQuery} from './__generated__/ProjectV2ItemStatusChangedEventUserTestQuery.graphql'

test('Renders single user actor event', () => {
  renderRelay<{query: ProjectV2ItemStatusChangedEventUserTestQuery}>(
    ({queryData}) => <ProjectV2ItemStatusChangedEvent queryRef={queryData.query.node!} issueUrl="test" />,
    {
      relay: {
        queries: {
          query: {
            type: 'fragment',
            query: graphql`
              query ProjectV2ItemStatusChangedEventUserTestQuery @relay_test_operation {
                node(id: "node-id") {
                  ... on ProjectV2ItemStatusChangedEvent {
                    ...ProjectV2ItemStatusChangedEvent
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
              actor: {
                login: 'monalisa',
                __typename: 'User',
              },
              previousStatus: 'To do',
              status: 'In progress',
            }
          },
        },
      },
    },
  )

  expect(screen.getByTestId('actor-link')).toHaveAttribute('href', '/monalisa')
  expect(screen.getByText('moved this from To do to In progress in')).toBeInTheDocument()
})

test('Renders single bot actor event', () => {
  renderRelay<{query: ProjectV2ItemStatusChangedEventBotTestQuery}>(
    ({queryData}) => <ProjectV2ItemStatusChangedEvent queryRef={queryData.query.node!} issueUrl="test" />,
    {
      relay: {
        queries: {
          query: {
            type: 'fragment',
            query: graphql`
              query ProjectV2ItemStatusChangedEventBotTestQuery @relay_test_operation {
                node(id: "node-id") {
                  ... on ProjectV2ItemStatusChangedEvent {
                    ...ProjectV2ItemStatusChangedEvent
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
              actor: {
                login: 'github-project-automation',
                __typename: 'Bot',
              },
              previousStatus: 'To do',
              status: 'In progress',
            }
          },
        },
      },
    },
  )

  expect(screen.getByTestId('actor-link')).toHaveAttribute('href', '/apps/github-project-automation')
  expect(screen.getByText('moved this from To do to In progress in')).toBeInTheDocument()
})
