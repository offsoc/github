// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'

import {getFileName} from '../../helpers/file-helpers'
import {usePullRequestAnalytics} from '../../hooks/use-pull-request-analytics'
import commitMarkFileAsViewedMutation from '../../mutations/mark-file-as-viewed-mutation'
import commitUnmarkFileAsViewedMutation from '../../mutations/unmark-file-as-viewed-mutation'
import type {
  ViewedCheckbox_diffEntry$data,
  ViewedCheckbox_diffEntry$key,
} from './__generated__/ViewedCheckbox_diffEntry.graphql'
import {MarkAsViewedButton} from './MarkAsViewedButton'

export interface ViewedCheckboxProps {
  diffEntry: ViewedCheckbox_diffEntry$key
  pullRequestId: string
  onChange?: (newValue: boolean) => void
}

export default function ViewedCheckbox({diffEntry, pullRequestId, onChange}: ViewedCheckboxProps) {
  const diffEntryData: ViewedCheckbox_diffEntry$data = useFragment(
    graphql`
      fragment ViewedCheckbox_diffEntry on PullRequestDiffEntry {
        id
        path
        viewerViewedState
      }
    `,
    diffEntry,
  )

  const {sendPullRequestAnalyticsEvent} = usePullRequestAnalytics()

  const environment = useRelayEnvironment()
  const {addToast} = useToastContext()
  const isViewed = diffEntryData.viewerViewedState === 'VIEWED'
  const toggleViewedMutation = isViewed ? commitUnmarkFileAsViewedMutation : commitMarkFileAsViewedMutation
  const toggleViewed = () => {
    onChange?.(!isViewed)

    const fileName = getFileName(diffEntryData.path)
    toggleViewedMutation({
      environment,
      input: {diffEntryId: diffEntryData.id, path: diffEntryData.path, pullRequestId},
      onError: (error: Error) =>
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: `Failed to ${isViewed ? 'unmark' : 'mark'} ${fileName} as viewed: ${error.message}`,
        }),
    })
    sendPullRequestAnalyticsEvent(`file_entry.${isViewed ? 'unviewed' : 'viewed'}`, 'MARK_FILE_VIEWED_BUTTON')
  }

  return <MarkAsViewedButton isViewed={isViewed} toggleViewed={toggleViewed} />
}
