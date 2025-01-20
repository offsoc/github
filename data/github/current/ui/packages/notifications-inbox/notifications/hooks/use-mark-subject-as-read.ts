import type {ItemIdentifier} from '@github-ui/issue-viewer/Types'
import {useEffect} from 'react'
import {fetchQuery, graphql, useRelayEnvironment} from 'react-relay'

import markNotificationSubjectAsReadMutation from '../mutations/mark-subject-as-read-mutation'
import type {
  useMarkSubjectAsReadQuery,
  useMarkSubjectAsReadQuery$data,
} from './__generated__/useMarkSubjectAsReadQuery.graphql'

const InboxSubjectReadQuery = graphql`
  query useMarkSubjectAsReadQuery($repo: String!, $owner: String!, $number: Int!) {
    repository(name: $repo, owner: $owner) {
      issue(number: $number) {
        __id
        isReadByViewer
      }
    }
  }
`

type MarkInboxSubjectAsReadMutationProps = {
  itemIdentifier?: ItemIdentifier
}

const useMarkInboxSubjectAsRead = ({itemIdentifier}: MarkInboxSubjectAsReadMutationProps) => {
  const environment = useRelayEnvironment()
  useEffect(
    function markInboxSubjectAsRead() {
      // No-op if no identifier specified
      if (!itemIdentifier) return
      // Look up identifier Relay ID
      fetchQuery<useMarkSubjectAsReadQuery>(environment, InboxSubjectReadQuery, itemIdentifier).subscribe({
        next: (data: useMarkSubjectAsReadQuery$data) => {
          // Ensure issue details are returned
          if (!data?.repository?.issue) return
          const {issue} = data.repository
          // Mark as read if not already
          !issue.isReadByViewer && markNotificationSubjectAsReadMutation({environment, subjectId: issue.__id})
        },
      })
    },
    [environment, itemIdentifier],
  )
}

export default useMarkInboxSubjectAsRead
