export interface Job {
  id: string
  queue: JobQueuesTypes
  state: JobState
  perform(): Promise<void> | void
  ttl: number
}

export const JobState = {
  PENDING: 'pending',
  STARTED: 'started',
  SUCCESS: 'success',
}
export type JobState = ObjectValues<typeof JobState>

export const JobQueuesTypes = {
  BULK_ADD_MEMEX_ITEMS: 'bulk-add-memex-items',
  BULK_DELETE_MEMEX_ITEMS: 'bulk-delete-memex-items',
  BULK_UNARCHIVE_MEMEX_ITEMS: 'bulk-unarchive-memex-items',
} as const
export type JobQueuesTypes = ObjectValues<typeof JobQueuesTypes>
