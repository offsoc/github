// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {ActionList} from '@primer/react'
import React from 'react'
import {graphql, useFragment, useMutation} from 'react-relay'

import {usePullRequestAnalytics} from '../hooks/use-pull-request-analytics'
import useQueryParam from '../hooks/use-query-param'
import type {updateWhitespacePreferenceMutation as updateWhitespacePreferenceType} from '../mutations/__generated__/updateWhitespacePreferenceMutation.graphql'
import updateWhitespacePreferenceGraphQLMutation from '../mutations/update-whitespace-preference-mutation'
import type {HideWhitespace_pullRequest$key} from './__generated__/HideWhitespace_pullRequest.graphql'

function useWhitespacePreference(defaultPreference: boolean): [boolean, (value: boolean) => void] {
  let hideWhitespace = defaultPreference
  const [whitespaceParam, updateWhitespaceQueryParam] = useQueryParam('w')
  if (whitespaceParam === '1') {
    hideWhitespace = true
  } else if (whitespaceParam === '0') {
    hideWhitespace = false
  }

  const setWhitespaceParam = React.useCallback(
    (value: boolean) => {
      updateWhitespaceQueryParam(value ? '1' : '0')
    },
    [updateWhitespaceQueryParam],
  )

  return [hideWhitespace, setWhitespaceParam]
}

export default function HideWhitespace({pullRequest}: {pullRequest: HideWhitespace_pullRequest$key}) {
  const pullRequestData = useFragment(
    graphql`
      fragment HideWhitespace_pullRequest on PullRequest {
        id
        viewerPreferences {
          ignoreWhitespace
        }
      }
    `,
    pullRequest,
  )

  const {addToast} = useToastContext()
  const {sendPullRequestAnalyticsEvent} = usePullRequestAnalytics()

  const [hideWhitespace, setWhitespaceParam] = useWhitespacePreference(
    !!pullRequestData.viewerPreferences.ignoreWhitespace,
  )
  const [commit, isInFlight] = useMutation<updateWhitespacePreferenceType>(updateWhitespacePreferenceGraphQLMutation)

  const toggleHideWhitespace = () => {
    const newHideWhitespace = !hideWhitespace
    commit({
      variables: {
        pullRequestId: pullRequestData.id,
        whitespacePreference: newHideWhitespace,
      },
      onError() {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'Failed to update whitespace preference',
        })
      },
    })
    sendPullRequestAnalyticsEvent('diff_view.toggle_whitespace', 'HIDE_WHITESPACE_CHECKBOX')
    setWhitespaceParam(newHideWhitespace)
  }

  return (
    <ActionList.Group selectionVariant="single" variant="subtle">
      <ActionList.GroupHeading>Whitespace</ActionList.GroupHeading>
      <ActionList.Item disabled={isInFlight} selected={hideWhitespace} onSelect={() => toggleHideWhitespace()}>
        Hide whitespace
      </ActionList.Item>
    </ActionList.Group>
  )
}
