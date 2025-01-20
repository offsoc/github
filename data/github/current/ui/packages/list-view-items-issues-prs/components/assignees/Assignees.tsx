import {CircleIcon, PersonIcon} from '@primer/octicons-react'
import {AvatarStack, Octicon} from '@primer/react'
import {graphql, usePaginationFragment} from 'react-relay'

import type {Assignees$key} from './__generated__/Assignees.graphql'
import {Assignee} from './Assignee'
import styles from './assignees.module.css'

type assigneesProps = {
  assigneeskey: Assignees$key
  /**
   * Href getter for the assignee badge links
   * @param name - name of the assignee
   * @returns URL to the assignee
   */
  getAssigneeHref: (assignee: string) => string
}

export function Assignees({assigneeskey, getAssigneeHref}: assigneesProps) {
  const {data} = usePaginationFragment(
    graphql`
      fragment Assignees on Assignable
      @argumentDefinitions(assigneePageSize: {type: "Int"}, cursor: {type: "String"})
      @refetchable(queryName: "IssueAssigneePaginatedQuery") {
        assignees(first: $assigneePageSize, after: $cursor) @connection(key: "IssueAssignees_assignees") {
          edges {
            node {
              id
              ...Assignee
            }
          }
        }
      }
    `,
    assigneeskey,
  )
  const assignees = (data.assignees?.edges || []).flatMap(a => (a && a.node ? a.node : []))

  if (assignees.length > 0) {
    return (
      <AvatarStack
        alignRight
        sx={{
          isolation: 'isolate',
        }}
      >
        {assignees.map(assignee => (
          <Assignee key={assignee.id} assignee={assignee} getAssigneeHref={getAssigneeHref} />
        ))}
      </AvatarStack>
    )
  }

  return (
    <div className={styles.noAssigneeContainer}>
      <Octicon icon={PersonIcon} sx={{position: 'absolute', color: 'border.muted'}} />
      <Octicon size={24} icon={CircleIcon} sx={{color: 'border.muted'}} />
    </div>
  )
}
