import {LABELS} from '../constants/labels'
import type {LabeledEvent$key} from './__generated__/LabeledEvent.graphql'
import type {UnlabeledEvent$key} from './__generated__/UnlabeledEvent.graphql'
import {AddedLabelsRendering} from './LabeledEvent'
import {UnlabeledRendering} from './UnlabeledEvent'

type LabeledEventProps = {
  rollupGroup: Record<string, Array<LabeledEvent$key | UnlabeledEvent$key>>
  timelineEventBaseUrl: string
}
export function RolledupLabeledEvent({rollupGroup, timelineEventBaseUrl}: LabeledEventProps): JSX.Element {
  const addedEvents = (rollupGroup['LabeledEvent'] as LabeledEvent$key[]) || []
  const removedEvents = (rollupGroup['UnlabeledEvent'] as UnlabeledEvent$key[]) || []

  return (
    <>
      <AddedLabelsRendering queryRefs={addedEvents} timelineEventBaseUrl={timelineEventBaseUrl} />
      {addedEvents.length > 0 && removedEvents.length > 0 && `${LABELS.timeline.and} `}
      <UnlabeledRendering queryRefs={removedEvents} timelineEventBaseUrl={timelineEventBaseUrl} />
    </>
  )
}
