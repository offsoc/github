import type {Meta} from '@storybook/react'
import {LazyContributorFooter} from './LazyContributorFooter'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {graphql} from 'react-relay'
import type {LazyContributorFooterQuery} from './__generated__/LazyContributorFooterQuery.graphql'

const meta = {
  title: 'IssuesComponents/ContributorFooter',
  component: LazyContributorFooter,
} satisfies Meta<typeof LazyContributorFooter>

export default meta

type LazyContributorFooterQueries = {
  lazyContributorFooterQuery: LazyContributorFooterQuery
}

export const LazyContributorFooterExample = {
  decorators: [relayDecorator<typeof LazyContributorFooter, LazyContributorFooterQueries>],
  parameters: {
    relay: {
      queries: {
        lazyContributorFooterQuery: {
          type: 'fragment',
          query: graphql`
            query LazyContributorFooterQuery @relay_test_operation {
              node(id: "abc") {
                ... on Repository {
                  ...LazyContributorFooter
                }
              }
            }
          `,
          variables: {},
        },
      },
      mockResolvers: {
        Repository() {
          return {
            codeOfConductFileUrl: 'code-of-conduct-file-url',
            securityPolicyUrl: 'security-policy-file-url',
            contributingFileUrl: 'contributing-file-url',
          }
        },
      },
      mapStoryArgs: ({queryData: {lazyContributorFooterQuery}}) => ({
        repositoryKey: lazyContributorFooterQuery.node!,
      }),
    },
  },
} satisfies RelayStoryObj<typeof LazyContributorFooter, LazyContributorFooterQueries>
