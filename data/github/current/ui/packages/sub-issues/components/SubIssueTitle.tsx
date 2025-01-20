import {graphql} from 'relay-runtime'
import type {SubIssueTitle$key} from './__generated__/SubIssueTitle.graphql'
import {NestedListItemTitle} from '@github-ui/nested-list-view/NestedListItemTitle'
import {useFragment} from 'react-relay'
import {issueHovercardPath} from '@github-ui/paths'
import {SubIssueTypeIndicator} from './SubIssueTypeIndicator'
import {useCallback, useMemo} from 'react'
import {NestedListItemTrailingBadge} from '@github-ui/nested-list-view/NestedListItemTrailingBadge'
import {SubIssuesCompletionPill} from './SubIssuesCompletionPill'
import type {SubIssueTitle_TitleValue$key} from './__generated__/SubIssueTitle_TitleValue.graphql'
import type {SubIssueSidePanelItem} from '../types/sub-issue-types'
import {renderToString} from 'react-dom/server'
import styles from './SubIssueTitle.module.css'

interface SubIssueTitleProps {
  issueKey: SubIssueTitle$key
  onClick?: (subIssueItem: SubIssueSidePanelItem) => void
}

export function SubIssueTitle({issueKey, onClick: externalOnClick}: SubIssueTitleProps) {
  const issueNode = useFragment(
    graphql`
      fragment SubIssueTitle on Issue @argumentDefinitions(fetchSubIssues: {type: "Boolean!"}) {
        url
        databaseId
        number
        repository {
          name
          owner {
            login
          }
        }
        state
        stateReason
        ...SubIssueTitle_TitleValue
        ...SubIssueTypeIndicator
        ...SubIssuesCompletionPill @arguments(fetchSubIssues: $fetchSubIssues)
      }
    `,
    issueKey,
  )
  const {databaseId: id, state, stateReason, url, number, repository} = issueNode
  // Separate fragment so we can just refetch the title alone when there is a live update
  const {title, titleHTML} = useFragment<SubIssueTitle_TitleValue$key>(
    graphql`
      fragment SubIssueTitle_TitleValue on Issue {
        title
        titleHTML
      }
    `,
    issueNode,
  )

  const hovercardPath = issueHovercardPath({
    issueNumber: number,
    repo: repository.name,
    owner: repository.owner.login,
  })

  const onClick = useCallback(
    (event: React.MouseEvent) => {
      // shortcircuit to default link behaviors if using middle click or modifiers
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (event.button === 1 || event.shiftKey || event.ctrlKey || event.metaKey) return
      // this is for when a sub-issue is clicked within the sidepanel
      if (externalOnClick) {
        event.preventDefault()

        externalOnClick({
          id: id ?? 0,
          number,
          owner: repository.owner.login,
          repo: repository.name,
          state,
          stateReason,
          title,
          url,
        })
      }
    },
    [externalOnClick, number, repository, id, state, stateReason, url, title],
  )

  const trailingBadges = useMemo(() => {
    const completionPill = <SubIssuesCompletionPill onClick={onClick} issueKey={issueNode} />

    const completionMetadata = completionPill ? (
      <NestedListItemTrailingBadge key={0} title="Sub-issues">
        {completionPill}
      </NestedListItemTrailingBadge>
    ) : null

    if (completionMetadata) return [completionMetadata]
    return undefined
  }, [onClick, issueNode])

  const titleWithNumber = `${titleHTML || title} ${renderToString(
    <span className={styles.titleNumber}>#{number}</span>,
  )}`

  return (
    <NestedListItemTitle
      value={titleWithNumber}
      href={url}
      additionalLinkProps={{'data-hovercard-url': hovercardPath}}
      leadingBadge={<SubIssueTypeIndicator dataKey={issueNode} />}
      onClick={onClick}
      trailingBadges={trailingBadges}
      anchorClassName={styles.titleAnchor}
    />
  )
}
