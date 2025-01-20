import type {RefComparison} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {comparePath} from '@github-ui/paths'
import {GitPullRequestIcon} from '@primer/octicons-react'
import {BranchName, Button, Link} from '@primer/react'

import {PopoverActions, PopoverContent, PopoverIcon} from './InfobarPopover'
import {RefComparisonText} from './RefComparisonText'
import {clsx} from 'clsx'
import LinkButtonCSS from '../../../css/LinkButton.module.css'

interface Props {
  comparison: RefComparison
}

export function ContributePopoverContent({comparison}: Props) {
  const repo = useCurrentRepository()

  const isAhead = comparison.ahead > 0
  const aheadLink = comparePath({repo, base: comparison.baseBranchRange, head: comparison.currentRef})

  return (
    <>
      <PopoverContent
        icon={<PopoverIcon bg="neutral.emphasis" icon={GitPullRequestIcon} />}
        header={
          isAhead ? (
            <RefComparisonText repo={repo} comparison={{...comparison, behind: 0}} />
          ) : (
            <span>
              This branch is not ahead of the upstream <BranchName as="span">{comparison.baseBranch}</BranchName>.
            </span>
          )
        }
        content={
          <p>
            {isAhead
              ? 'Open a pull request to contribute your changes upstream.'
              : 'No new commits yet. Enjoy your day!'}
          </p>
        }
      />
      {isAhead && (
        <PopoverActions>
          {!repo.isFork && (
            <Button
              as={Link}
              className={clsx(LinkButtonCSS['code-view-link-button'], 'flex-1')}
              href={aheadLink}
              data-testid="compare-button"
            >
              Compare
            </Button>
          )}
          <Button
            as={Link}
            className={clsx(LinkButtonCSS['code-view-link-button'], 'flex-1')}
            href={`${aheadLink}?expand=1`}
            variant="primary"
            data-testid="open-pr-button"
          >
            Open pull request
          </Button>
        </PopoverActions>
      )}
    </>
  )
}
