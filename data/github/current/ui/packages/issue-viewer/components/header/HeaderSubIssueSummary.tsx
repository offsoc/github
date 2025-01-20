import {graphql, useFragment} from 'react-relay'
import type {HeaderSubIssueSummary$key} from './__generated__/HeaderSubIssueSummary.graphql'
import type {HeaderSubIssueSummaryWithPrimary$key} from './__generated__/HeaderSubIssueSummaryWithPrimary.graphql'
import {Token} from '@primer/react'
import styles from './HeaderSubIssuesSummary.module.css'
import {ProgressCircle} from '@github-ui/progress-circle'
import {useSubIssuesSummary} from '@github-ui/sub-issues/useSubIssuesSummary'

export type HeaderSubIssueSummaryProps = {
  subIssuePrimaryKey?: HeaderSubIssueSummaryWithPrimary$key
  subIssueSecondaryKey?: HeaderSubIssueSummary$key
  size?: 'xlarge' | 'small'
}

export function HeaderSubIssueSummary({
  subIssuePrimaryKey,
  subIssueSecondaryKey,
  size = 'xlarge',
}: HeaderSubIssueSummaryProps) {
  // When the secondary query becomes available, prefer calculating summary with sub-issues directly, rather than using the summary
  // This avoids issues where the summary becomes stale after a live update
  const node = useFragment(
    graphql`
      fragment HeaderSubIssueSummary on Issue {
        ...useSubIssuesSummary @arguments(fetchSubIssues: true)
      }
    `,
    subIssueSecondaryKey,
  )

  const {completed, percentCompleted, total} = useSubIssuesSummary(node ?? undefined)

  return node ? (
    <HeaderSubIssueSummaryInternal
      completed={completed}
      percentCompleted={percentCompleted}
      total={total}
      size={size}
    />
  ) : (
    <HeaderSubIssueSummaryWithPrimary subIssueSummaryKey={subIssuePrimaryKey} size={size} />
  )
}

export type HeaderSubIssueSummarWithPrimaryProps = {
  subIssueSummaryKey?: HeaderSubIssueSummaryWithPrimary$key
  size?: 'xlarge' | 'small'
}

export function HeaderSubIssueSummaryWithPrimary({
  subIssueSummaryKey,
  size = 'xlarge',
}: HeaderSubIssueSummarWithPrimaryProps) {
  const node = useFragment(
    graphql`
      fragment HeaderSubIssueSummaryWithPrimary on Issue {
        ...useSubIssuesSummary @arguments(fetchSubIssues: false)
      }
    `,
    subIssueSummaryKey,
  )

  const {completed, percentCompleted, total} = useSubIssuesSummary(node ?? undefined)

  if (!node) return <></>

  return (
    <HeaderSubIssueSummaryInternal
      completed={completed}
      percentCompleted={percentCompleted}
      total={total}
      size={size}
    />
  )
}

export type HeaderSubIssueSummaryInternalProps = {
  subIssueSummaryKey?: HeaderSubIssueSummary$key
  completed: number
  percentCompleted: number
  total: number
  size: 'xlarge' | 'small'
}

export function HeaderSubIssueSummaryInternal({
  completed,
  total,
  percentCompleted,
  size,
}: HeaderSubIssueSummaryInternalProps) {
  const visualLabel = `${completed} / ${total}`
  const label = `${completed} of ${total} ${total === 1 ? 'issue' : 'issues'} completed`

  if (total === 0 || isNaN(percentCompleted)) return null

  if (size === 'small') {
    return (
      <div className={styles.smallSummary}>
        <ProgressCircle percentCompleted={percentCompleted} />

        <span aria-hidden="true" className={styles.visualLabel}>
          {visualLabel}
        </span>
        <span className="sr-only">{label}</span>
      </div>
    )
  }

  return (
    <Token
      text={
        <>
          <span aria-hidden="true" className={styles.visualLabel}>
            {visualLabel}
          </span>
          <span className="sr-only">{label}</span>
        </>
      }
      leadingVisual={() => <ProgressCircle percentCompleted={percentCompleted} />}
      className={styles.token}
      size="xlarge"
    />
  )
}
