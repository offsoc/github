import {useSearchParams} from '@github-ui/use-navigate'
import {ActionList} from '@primer/react'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'

import updatePreferredDiffViewMutation from '../mutations/update-preferred-diff-view-mutation'
import type {DiffViewToggle_user$key} from './__generated__/DiffViewToggle_user.graphql'

export default function DiffViewToggle({user}: {user: DiffViewToggle_user$key}) {
  const {id, pullRequestUserPreferences} = useFragment(
    graphql`
      fragment DiffViewToggle_user on User {
        id
        pullRequestUserPreferences {
          diffView
        }
      }
    `,
    user,
  )

  const [searchParams, setSearchParams] = useSearchParams()
  const searchParamDiffView = searchParams.get('diff')
  const preferredDiffView = searchParamDiffView ?? pullRequestUserPreferences.diffView
  const environment = useRelayEnvironment()
  const setPreferredDiffView = (newDiffView: 'unified' | 'split') => {
    // don't need to update if the server diff view is being overriden by search param
    if (newDiffView !== pullRequestUserPreferences.diffView) {
      updatePreferredDiffViewMutation(environment, {viewerId: id, newDiffView})
    }

    if (newDiffView !== preferredDiffView) {
      setSearchParams({diff: newDiffView})
    }
  }

  const isSplitSelected = preferredDiffView === 'split'
  return (
    <ActionList.Group selectionVariant="single">
      <ActionList.GroupHeading>Layout</ActionList.GroupHeading>
      <ActionList.Item selected={!isSplitSelected} onSelect={() => setPreferredDiffView('unified')}>
        Unified
      </ActionList.Item>
      <ActionList.Item selected={isSplitSelected} onSelect={() => setPreferredDiffView('split')}>
        Split
      </ActionList.Item>
    </ActionList.Group>
  )
}
