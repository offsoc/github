import {useFragment, useLazyLoadQuery} from 'react-relay'
import {graphql} from 'relay-runtime'
import type {IssueAssignees_SelectedAssigneesFragment$key} from './__generated__/IssueAssignees_SelectedAssigneesFragment.graphql'
import type {IssueAssigneesList_Fragment_Query} from './__generated__/IssueAssigneesList_Fragment_Query.graphql'
import type {IssueAssignees_List_Fragment$key} from './__generated__/IssueAssignees_List_Fragment.graphql'

export function IssueAssignees({
  selectedAssigneesKey,
}: {
  selectedAssigneesKey: IssueAssignees_SelectedAssigneesFragment$key
}) {
  const result = useFragment(
    graphql`
      fragment IssueAssignees_SelectedAssigneesFragment on UserConnection {
        nodes {
          id
          login
        }
      }
    `,
    selectedAssigneesKey,
  )

  return (
    <div>
      {result.nodes?.map(assignee => (
        <div key={assignee?.id}>
          <div>{assignee?.login}</div>
        </div>
      ))}
      <AssigneesList />
    </div>
  )
}

function AssigneesList() {
  const IssueAssigneesList_Fragment = graphql`
    fragment IssueAssignees_List_Fragment on Assignable
    @argumentDefinitions(cursor: {type: "String"}, count: {type: "Int", defaultValue: 50}, query: {type: "String"}) {
      suggestedAssignees(first: $count, after: $cursor, query: $query) {
        edges {
          node {
            login
            id
          }
        }
      }
    }
  `

  const result = useLazyLoadQuery<IssueAssigneesList_Fragment_Query>(
    graphql`
      query IssueAssigneesList_Fragment_Query($repo: String!, $owner: String!, $number: Int!) {
        repository(name: $repo, owner: $owner) {
          issueOrPullRequest(number: $number) {
            ... on Assignable {
              ...IssueAssignees_List_Fragment
            }
          }
        }
      }
    `,
    {
      repo: 'repo',
      owner: 'owner',
      number: 1,
    },
  )

  const data = useFragment(
    IssueAssigneesList_Fragment,
    result?.repository?.issueOrPullRequest as IssueAssignees_List_Fragment$key,
  )

  return (
    <div>
      {data?.suggestedAssignees?.edges?.map(assignee => <div key={assignee?.node?.id}>{assignee?.node?.login}</div>)}
    </div>
  )
}
