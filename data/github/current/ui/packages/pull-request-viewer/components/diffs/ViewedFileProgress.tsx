import {Box, Text} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {graphql, useFragment} from 'react-relay'

import type {ViewedFileProgress_pullRequest$key} from './__generated__/ViewedFileProgress_pullRequest.graphql'

type ProgressIconProps = {
  progress: number
}

const ProgressIcon = ({progress}: ProgressIconProps) => {
  return (
    <svg data-circumference="38" height="16" role="presentation" style={{transform: 'rotate(-90deg)'}} width="16">
      <circle
        cx="50%"
        cy="50%"
        fill="transparent"
        r="6"
        stroke="var(--borderColor-default, var(--color-border-default))"
        strokeWidth="2"
      />
      <circle
        cx="50%"
        cy="50%"
        fill="transparent"
        r="6"
        stroke="var(--fgColor-done, var(--color-done-fg))"
        strokeDasharray={38}
        strokeDashoffset={38 - progress * 38}
        strokeLinecap="round"
        strokeWidth="2"
        style={{transition: 'stroke-dashoffset 0.35s'}}
      />
    </svg>
  )
}

export default function ViewedFileProgress({
  pullRequest,
  sx,
}: {
  pullRequest: ViewedFileProgress_pullRequest$key
  sx?: BetterSystemStyleObject
}) {
  const pullRequestData = useFragment(
    graphql`
      fragment ViewedFileProgress_pullRequest on PullRequest {
        comparison(startOid: $startOid, endOid: $endOid, singleCommitOid: $singleCommitOid) {
          summary {
            __typename
          }
        }
        viewerViewedFiles
      }
    `,
    pullRequest,
  )

  const total = pullRequestData.comparison?.summary?.length
  const viewed = pullRequestData.viewerViewedFiles

  if (!total) return null

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, ...sx}}>
      <ProgressIcon progress={viewed / total || 0} />
      <Text sx={{fontSize: 0, color: 'fg.muted', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
        <Text sx={{fontWeight: 500, color: 'fg.default'}}>{viewed}</Text> /{' '}
        <Text sx={{fontWeight: 500, color: 'fg.default'}}>{total}</Text>{' '}
        <Text sx={{display: ['none', 'none', 'none', 'inline-flex']}}>viewed</Text>
      </Text>
    </Box>
  )
}
