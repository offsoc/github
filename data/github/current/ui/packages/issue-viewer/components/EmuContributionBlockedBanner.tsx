import {Flash} from '@primer/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import type {EmuContributionBlockedBannerQuery} from './__generated__/EmuContributionBlockedBannerQuery.graphql'

type EmuContributionBlockedBannerProps = {
  enterpriseId: string
}

export const EmuContributionBlockedBannerGraphQLQuery = graphql`
  query EmuContributionBlockedBannerQuery($enterpriseId: ID!) {
    node(id: $enterpriseId) {
      ... on Enterprise {
        slug
      }
    }
  }
`

export const EmuContributionBlockedBanner = ({enterpriseId}: EmuContributionBlockedBannerProps) => {
  const enterprise = useLazyLoadQuery<EmuContributionBlockedBannerQuery>(EmuContributionBlockedBannerGraphQLQuery, {
    enterpriseId,
  })
  return (
    <Flash
      sx={{mt: '16px'}}
      variant={'warning'}
    >{`You cannot contribute to repositories outside of your enterprise ${enterprise.node?.slug}.`}</Flash>
  )
}
