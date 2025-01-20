import {type Job, type JobQueuesTypes, JobState} from './job'

export abstract class BaseJob implements Job {
  static DEFAULT_TTL = 60 * 60 * 24 * 7 //One week in seconds. The default TTL for Jobs in Dotcom
  declare state: JobState
  declare readonly id: string
  declare ttl: number
  abstract queue: JobQueuesTypes

  constructor() {
    this.id = window.crypto.randomUUID()
    this.state = JobState.PENDING
    this.ttl = BaseJob.DEFAULT_TTL
  }

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  abstract perform(): Promise<any> | any
}
