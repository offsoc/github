import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'

import {useEnabledFeatures} from '../../../../hooks/use-enabled-features'
import {useIssueContext} from '../../../../state-providers/issues/use-issue-context'
import {TrackedByLabel} from './tracked-by-label'
import {RestyledTrackedByLabel} from './tracked-by-label-restyled'
import {TracksLabel} from './tracks-label'

/**
 * Renders the tracking fields (Tracks, Tracked By) for the current item
 * from the side panel metadata.
 */
export const TrackingFields: React.FC = () => {
  const {sidePanelMetadata} = useIssueContext()
  const {completion, itemKey, trackedBy, url} = sidePanelMetadata
  const issueId = itemKey.kind === 'issue' ? itemKey.itemId : undefined

  const {tasklist_tracked_by_redesign} = useEnabledFeatures()

  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: '8px'}} {...testIdProps('tracking-fields')}>
      <TracksLabel completion={completion} />
      {trackedBy?.length ? (
        tasklist_tracked_by_redesign ? (
          <RestyledTrackedByLabel issueId={issueId} items={trackedBy} url={url} />
        ) : (
          <TrackedByLabel currentValue={trackedBy} />
        )
      ) : null}
    </Box>
  )
}
