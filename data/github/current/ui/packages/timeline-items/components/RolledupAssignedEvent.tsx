import {LABELS} from '../constants/labels'
import {AddedAssigneesRendering} from './AssignedEvent'
import {RemovedAssigneesRendering} from './UnassignedEvent'
import type {AssignedEvent$key} from './__generated__/AssignedEvent.graphql'
import type {UnassignedEvent$key} from './__generated__/UnassignedEvent.graphql'

type AssignedEventProps = {
  rollupGroup: Record<string, Array<AssignedEvent$key | UnassignedEvent$key>>
}
export function RolledupAssignedEvent({rollupGroup}: AssignedEventProps): JSX.Element {
  const addedEvents = (rollupGroup['AssignedEvent'] as AssignedEvent$key[]) || []
  const removedEvents = (rollupGroup['UnassignedEvent'] as UnassignedEvent$key[]) || []

  return (
    <>
      <AddedAssigneesRendering queryRefs={addedEvents} selfAssigned={false} rollup={true} />
      {addedEvents.length > 0 && removedEvents.length > 0 && ` ${LABELS.timeline.and} `}
      <RemovedAssigneesRendering queryRefs={removedEvents} selfAssigned={false} rollup={true} />
    </>
  )
}
