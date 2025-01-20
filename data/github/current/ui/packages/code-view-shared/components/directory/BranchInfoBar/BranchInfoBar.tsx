import {useCurrentRepository} from '@github-ui/current-repository'
import {Box, Flash, type SxProp} from '@primer/react'
import type React from 'react'

import {SkeletonText} from '../../Skeleton'
import {useBranchInfoBar} from '../../../hooks/use-branch-infobar'
import {ContributeButton} from './ContributeButton'
import {FetchUpstreamButton} from './FetchUpstreamButton'
import {PullRequestLink} from './PullRequestLink'
import {RefComparisonText} from './RefComparisonText'

export function BranchInfoBar({sx}: SxProp) {
  const [infoBar, error] = useBranchInfoBar()
  const repo = useCurrentRepository()

  let content

  if (error === 'timeout') {
    content = <>Sorry, getting ahead/behind information for this branch is taking too long.</>
  } else if (!infoBar) {
    content = (
      <>
        <SkeletonText width="40%" />
        <SkeletonText width="30%" />
      </>
    )
  } else if (!infoBar.refComparison) {
    content = <>Cannot retrieve ahead/behind information for this branch.</>
  } else {
    content = (
      <>
        <RefComparisonText linkify repo={repo} comparison={infoBar.refComparison} />
        <div className="d-flex gap-2">
          {infoBar.pullRequestNumber ? (
            <PullRequestLink repo={repo} pullRequestNumber={infoBar.pullRequestNumber} />
          ) : (
            <>
              {repo.currentUserCanPush && <ContributeButton comparison={infoBar.refComparison} />}
              {repo.isFork && repo.currentUserCanPush && <FetchUpstreamButton comparison={infoBar.refComparison} />}
            </>
          )}
        </div>
      </>
    )
  }
  return (
    <BranchInfoBarContainer
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        border: 'solid 1px',
        borderColor: 'border.default',
        borderRadius: '6px',
        pl: 3,
        pr: 2,
        py: 2,
        mb: 3,
        minHeight: '50px',
        ...sx,
      }}
    >
      {content}
    </BranchInfoBarContainer>
  )
}

function BranchInfoBarContainer({children, sx}: React.PropsWithChildren & SxProp) {
  return (
    <Box
      data-testid="branch-info-bar"
      aria-live="polite"
      sx={{
        display: 'flex',
        gap: 2,
        bg: 'canvas.subtle',
        fontSize: 1,
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

export function BranchInfoBarErrorBanner() {
  return (
    <Flash variant="warning" className="my-3">
      <span>Cannot retrieve comparison with upstream repository.</span>
    </Flash>
  )
}
