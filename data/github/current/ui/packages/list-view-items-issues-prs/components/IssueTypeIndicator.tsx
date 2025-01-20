import {graphql, useFragment} from 'react-relay'

import type {IssueTypeIndicator$key} from './__generated__/IssueTypeIndicator.graphql'
import {IssueTypeToken} from '@github-ui/issue-type-token'
import styles from './IssueTypeIndicator.module.css'

const issueTypeQuery = graphql`
  fragment IssueTypeIndicator on Issue {
    issueType {
      id
      name
      color
    }
  }
`
type Props = {
  dataKey: IssueTypeIndicator$key
  getIssueTypeHref: (login: string) => string
}

export const IssueTypeIndicator = ({dataKey, getIssueTypeHref}: Props) => {
  const {issueType} = useFragment(issueTypeQuery, dataKey)

  const shouldNotRender = !issueType?.id || !issueType?.name

  if (shouldNotRender) {
    return null
  }

  const getTooltipText = (isTruncated: boolean) => {
    return isTruncated ? issueType.name : undefined
  }

  return (
    <div className={styles.container}>
      <IssueTypeToken
        name={issueType.name}
        color={issueType.color}
        href={getIssueTypeHref(issueType.name)}
        getTooltipText={getTooltipText}
      />
    </div>
  )
}
