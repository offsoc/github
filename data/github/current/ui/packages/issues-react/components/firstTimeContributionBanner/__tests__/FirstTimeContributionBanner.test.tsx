import {renderRelay} from '@github-ui/relay-test-utils'
import {screen, waitFor} from '@testing-library/react'
import {FirstTimeContributionBanner} from '../FirstTimeContributionBanner'
import {graphql} from 'react-relay'
import {Wrapper} from '@github-ui/react-core/test-utils'
import type {FirstTimeContributionBannerTestQuery} from './__generated__/FirstTimeContributionBannerTestQuery.graphql'

const setup = (overrides = {}) => {
  renderRelay<{firstTimeContributionBannerQuery: FirstTimeContributionBannerTestQuery}>(
    ({queryData}) => <FirstTimeContributionBanner repository={queryData.firstTimeContributionBannerQuery.node!} />,
    {
      relay: {
        queries: {
          firstTimeContributionBannerQuery: {
            type: 'fragment',
            query: graphql`
              query FirstTimeContributionBannerTestQuery @relay_test_operation {
                node(id: "repo") {
                  ... on Repository {
                    ...FirstTimeContributionBanner
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
              showFirstTimeContributorBanner: true,
              nameWithOwner: 'github/github',
              contributingGuidelines: {
                url: 'https://github.com/github/github/blob/main/CONTRIBUTING.md',
              },
              communityProfile: {
                goodFirstIssueIssuesCount: 1,
              },
              url: 'https://github.com/github/github',
              ...overrides,
            }
          },
        },
      },
      wrapper: Wrapper,
    },
  )
}

test('it does not render if the server says so', async () => {
  setup({showFirstTimeContributorBanner: false})
  await waitFor(() => expect(screen.queryByText('Want to contribute', {exact: false})).not.toBeInTheDocument())
})

test('it shows banner with link to repo contributing guidelines', async () => {
  setup()
  expect(await screen.findByText('Want to contribute', {exact: false})).toBeVisible()
  expect(screen.getByTestId('repo-contributing-guidelines')).toBeVisible()
})

test('it shows banner with link to contributing guidelines', async () => {
  setup({contributingGuidelines: null})
  expect(await screen.findByText('Want to contribute', {exact: false})).toBeVisible()
  expect(screen.getByTestId('open-source-guide')).toBeVisible()
})

test('has link to good first issues', async () => {
  setup()
  expect(await screen.findByText('Want to contribute', {exact: false})).toBeVisible()
  expect(screen.getByTestId('repo-good-first-issues')).toBeVisible()
})

test('does not have link to good first issues if none available', async () => {
  setup({communityProfile: {goodFirstIssueIssuesCount: 0}})
  expect(await screen.findByText('Want to contribute', {exact: false})).toBeVisible()
  expect(screen.queryByTestId('repo-good-first-issues')).not.toBeInTheDocument()
})
