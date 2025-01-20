import {graphql} from 'relay-runtime'
import type {MilestoneMetadata$key} from './__generated__/MilestoneMetadata.graphql'
import {useFragment} from 'react-relay'
import {Link, Octicon, Truncate} from '@primer/react'
import {MilestoneIcon} from '@primer/octicons-react'

const milestoneFragment = graphql`
  fragment MilestoneMetadata on IssueOrPullRequest {
    ... on Issue {
      milestone {
        title
        url
      }
    }

    ... on PullRequest {
      milestone {
        title
        url
      }
    }
  }
`

type MilestoneMetadataProps = {
  data: MilestoneMetadata$key
}

export const MilestoneMetadata = ({data}: MilestoneMetadataProps) => {
  const {milestone} = useFragment(milestoneFragment, data)

  if (!milestone) return null

  return (
    <>
      &nbsp;&middot;&nbsp;
      <Link
        href={milestone.url}
        muted={true}
        aria-label={milestone.title}
        sx={{display: 'inline-flex', verticalAlign: 'bottom'}}
      >
        <Octicon icon={MilestoneIcon} size={16} />
        &nbsp;
        <Truncate
          title={milestone.title}
          sx={{
            display: 'inline-block',
            maxWidth: '100px',
            verticalAlign: 'bottom',
          }}
        >
          {milestone.title}
        </Truncate>
      </Link>
    </>
  )
}
