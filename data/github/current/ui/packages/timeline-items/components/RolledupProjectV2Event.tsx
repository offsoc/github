/* eslint eslint-comments/no-use: off */
/* eslint-disable filenames/match-regex */
import {LABELS} from '../constants/labels'
import {AddedToProjectV2sRendering} from './AddedToProjectV2Event'
import {RemovedFromProjectV2sRendering} from './RemovedFromProjectV2Event'
import type {AddedToProjectV2Event$key} from './__generated__/AddedToProjectV2Event.graphql'
import type {RemovedFromProjectV2Event$key} from './__generated__/RemovedFromProjectV2Event.graphql'

type RolledupProjectV2EventProps = {
  rollupGroup: Record<string, Array<AddedToProjectV2Event$key | RemovedFromProjectV2Event$key>>
}

export function RolledupProjectV2Event({rollupGroup}: RolledupProjectV2EventProps): JSX.Element {
  const addedEvents = (rollupGroup['AddedToProjectV2Event'] as AddedToProjectV2Event$key[]) || []
  const removedEvents = (rollupGroup['RemovedFromProjectV2Event'] as RemovedFromProjectV2Event$key[]) || []

  return (
    <>
      <AddedToProjectV2sRendering queryRefs={addedEvents} />
      {addedEvents.length > 0 && removedEvents.length > 0 && ` ${LABELS.timeline.and} `}
      <RemovedFromProjectV2sRendering queryRefs={removedEvents} />
    </>
  )
}
