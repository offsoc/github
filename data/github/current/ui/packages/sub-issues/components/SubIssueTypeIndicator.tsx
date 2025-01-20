import {type Dispatch, type SetStateAction, useEffect} from 'react'
import {graphql, useFragment} from 'react-relay'
import {NestedListItemLeadingBadge} from '@github-ui/nested-list-view/NestedListItemLeadingBadge'
import styles from './SubIssueTypeIndicator.module.css'
import type {SubIssueTypeIndicator$key} from './__generated__/SubIssueTypeIndicator.graphql'
import {getIssueSearchURL} from '../utils/urls'
import {isColorName} from '@github-ui/use-named-color'

const subIssueTypeQuery = graphql`
  fragment SubIssueTypeIndicator on Issue {
    number
    issueType {
      id
      name
      color
    }
    repository {
      name
      owner {
        login
      }
    }
  }
`
type Props = {
  dataKey: SubIssueTypeIndicator$key
  // TODO: clean up once https://github.com/github/collaboration-workflows-flex/issues/256 is merged
  onRender?: Dispatch<SetStateAction<boolean>>
}

export const SubIssueTypeIndicator = ({dataKey, onRender}: Props) => {
  const {issueType, number, repository} = useFragment(subIssueTypeQuery, dataKey)

  const shouldNotRender = !issueType?.id || !issueType?.name

  // Temp solution, TODO: clean up once https://github.com/github/collaboration-workflows-flex/issues/256 is merged,
  // see https://github.slack.com/archives/C05HD5GU6CA/p1700480160214479
  useEffect(() => {
    if (!shouldNotRender && onRender) {
      onRender?.(true)
    }
  }, [onRender, shouldNotRender])

  if (shouldNotRender) {
    return null
  }

  return (
    <NestedListItemLeadingBadge
      data-testid={`${number}-sub-issue-type-indicator-${issueType.name}`}
      key={issueType.id}
      className={styles.container}
      size="small"
      variant="secondary"
      title={issueType.name}
      color={isColorName(issueType.color) ? issueType.color : undefined}
      href={getIssueSearchURL({owner: repository.owner.login, repo: repository.name}, 'type', issueType.name)}
    />
  )
}
