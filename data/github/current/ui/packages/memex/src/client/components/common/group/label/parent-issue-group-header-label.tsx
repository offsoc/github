import {Box, Link} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

// eslint-disable-next-line no-restricted-imports
import styles from '../../../../../client/components/fields/progress-bar/progress-bar.module.css'
import type {ParentIssue} from '../../../../api/common-contracts'
import {ItemType} from '../../../../api/memex-items/item-type'
import {useOpenParentIssue} from '../../../../features/sub-issues/use-open-parent-issue'
import type {FieldAggregate} from '../../../../hooks/use-aggregation-settings'
import {SubIssuesProgressBar} from '../../../fields/sub-issues-progress-bar'
import {ItemState} from '../../../item-state'
import {AggregateLabels} from '../../aggregate-labels'
import {SanitizedGroupHeaderText} from '../sanitized-group-header-text'

type Props = {
  parentIssue: ParentIssue
  rowCount: number
  hideItemsCount: boolean
  aggregates: Array<FieldAggregate>
  titleSx?: BetterSystemStyleObject
}

// Sets a sensible default width for the solid & segmented progress bar. Without this explicit width,
// the progress bar collapses as it's used in container queries.
const progressBarSx: BetterSystemStyleObject = {
  [`:not(:has(.${styles.containerRing}))`]: {
    width: '175px',
  },
}

export const ParentIssueGroupHeaderLabel: React.FC<Props> = ({
  parentIssue,
  rowCount,
  aggregates,
  hideItemsCount,
  titleSx,
}) => {
  const {total, completed, percentCompleted} = parentIssue.subIssueList
  const {openParentIssue} = useOpenParentIssue()
  const titleWithNumber = `${parentIssue.title} #${parentIssue.number}`
  return (
    <>
      <ItemState
        isDraft={false}
        state={parentIssue.state}
        stateReason={parentIssue.stateReason}
        type={ItemType.Issue}
      />
      <Link
        href={parentIssue.url}
        onClick={event => {
          // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
          if (event.metaKey || event.shiftKey || event.button === 1) return
          event.preventDefault()
          openParentIssue(parentIssue)
        }}
      >
        <SanitizedGroupHeaderText titleHtml={titleWithNumber} sx={titleSx} />
      </Link>
      <AggregateLabels
        counterSx={{color: 'fg.muted'}}
        itemsCount={rowCount}
        aggregates={aggregates}
        hideItemsCount={hideItemsCount}
      />
      <Box sx={progressBarSx}>
        <SubIssuesProgressBar total={total} completed={completed} percentCompleted={percentCompleted} />
      </Box>
    </>
  )
}
