import {graphql, useFragment} from 'react-relay'
import type {FirstTimeContributionBanner$key} from './__generated__/FirstTimeContributionBanner.graphql'
import {FirstTimeContributionBannerDisplay} from './FirstTimeContributionBannerDisplay'

export type FirstTimeContributionBannerProps = {
  repository: FirstTimeContributionBanner$key
}

export const FirstTimeContributionBanner = ({repository}: FirstTimeContributionBannerProps) => {
  const data = useFragment(
    graphql`
      fragment FirstTimeContributionBanner on Repository {
        showFirstTimeContributorBanner(isPullRequests: false)
        nameWithOwner
        contributingGuidelines {
          url
        }
        communityProfile {
          goodFirstIssueIssuesCount
        }
        url
      }
    `,
    repository,
  )

  if (!data.showFirstTimeContributorBanner) {
    return null
  }

  return (
    <FirstTimeContributionBannerDisplay
      repoNameWithOwner={data.nameWithOwner}
      contributingGuidelinesUrl={data.contributingGuidelines?.url ?? undefined}
      hasGoodFirstIssueIssues={Boolean(data.communityProfile?.goodFirstIssueIssuesCount)}
      contributeUrl={`${data.url}/contribute`}
    />
  )
}
