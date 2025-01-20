import {graphql, useFragment} from 'react-relay'

import type {useAssigneeDescription$key} from './__generated__/useAssigneeDescription.graphql'

export const useAssigneesDescription = (assigneeSource: useAssigneeDescription$key) => {
  const data = useFragment(
    graphql`
      fragment useAssigneeDescription on Assignable @argumentDefinitions(assigneePageSize: {type: "Int"}) {
        assignees(first: $assigneePageSize) {
          nodes {
            login
          }
        }
      }
    `,
    assigneeSource,
  )
  const assignees = (data.assignees.nodes || []).flatMap(node => (node ? [node] : []))
  if (assignees.length === 0) {
    return ''
  }
  if (assignees.length === 1) {
    return ` assigned to ${assignees[0]!.login};`
  }
  return ` assigned to ${assignees
    .slice(0, -1)
    .map(assignee => assignee.login)
    .join(', ')} and ${assignees[assignees.length - 1]!.login};`
}
