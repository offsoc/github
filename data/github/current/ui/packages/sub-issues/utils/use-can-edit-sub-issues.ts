import {useFragment} from 'react-relay'
import {graphql} from 'relay-runtime'
import type {useCanEditSubIssues$key} from './__generated__/useCanEditSubIssues.graphql'

/**
 * Returns true if the current viewer can edit sub-issues for the given issue.
 *
 * Returns false if:
 * - the issue's repository is archived
 * - the current viewer does not have write access for the issue
 *   - note: we check `viewerCanUpdateMetadata` for this to exclude authors of issues without at least a triage role
 * */
export function useCanEditSubIssues(issueKey: useCanEditSubIssues$key | null | undefined) {
  const data = useFragment(
    graphql`
      fragment useCanEditSubIssues on Issue {
        viewerCanUpdateMetadata
        repository {
          isArchived
        }
      }
    `,
    issueKey,
  )

  const {viewerCanUpdateMetadata, repository} = data ?? {}
  return viewerCanUpdateMetadata && !repository?.isArchived
}
