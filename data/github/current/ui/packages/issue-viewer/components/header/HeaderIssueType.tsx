import {IssueTypeToken} from '@github-ui/issue-type-token'
import {graphql} from 'relay-runtime'
import {useFragment} from 'react-relay'
import type {HeaderIssueType$key} from './__generated__/HeaderIssueType.graphql'
import styles from './HeaderIssueType.module.css'

export type HeaderIssueTypeProps = {
  data: HeaderIssueType$key
}

const IssueTypeFragment = graphql`
  fragment HeaderIssueType on Issue {
    repository {
      nameWithOwner
    }
    issueType {
      name
      color
    }
  }
`

export function HeaderIssueType({data}: HeaderIssueTypeProps) {
  const {issueType, repository} = useFragment<HeaderIssueType$key>(IssueTypeFragment, data)

  if (!issueType) return null

  const getTooltipText = (isTextTruncated: boolean) => {
    return isTextTruncated ? issueType.name : undefined
  }

  return (
    <IssueTypeToken
      name={issueType.name}
      color={issueType.color}
      href={`/${repository.nameWithOwner}/issues?q=type:"${issueType.name}"`}
      getTooltipText={getTooltipText}
      size="large"
      sx={{p: 'var(--base-size-8) var(--base-size-12)', lineHeight: 'var(--base-size-16)'}}
    />
  )
}

export const SmallHeaderIssueType = ({data}: HeaderIssueTypeProps) => {
  const {issueType} = useFragment<HeaderIssueType$key>(IssueTypeFragment, data)

  if (!issueType) return null

  return <div className={styles.smallToken}>{issueType.name}</div>
}
