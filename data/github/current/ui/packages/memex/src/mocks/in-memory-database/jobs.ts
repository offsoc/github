import {type Job, JobQueuesTypes, JobState} from '../jobs/job'

class JobQueue {
  jobs: Array<Job> = []
  #processingJobs = false
  declare queueName: JobQueuesTypes

  constructor(queueName: JobQueuesTypes) {
    this.queueName = queueName
    this.jobs = []
  }

  enqueue(job: Job) {
    if (this.jobs.includes(job)) return
    this.jobs.push(job)
    if (!this.#processingJobs) {
      this.#processJobs()
    }
  }

  async #processJobs() {
    this.#processingJobs = true
    while (this.jobs.length > 0) {
      await new Promise<void>(resolve => {
        setTimeout(async () => {
          const job = this.jobs.shift()
          if (!job) return resolve()
          await wait(DEFAULT_WAIT_TIME)
          job.state = JobState.STARTED
          await Promise.all([job.perform(), wait(DEFAULT_WAIT_TIME)])
          job.state = JobState.SUCCESS
          resolve()
        })
      })
    }
    this.#processingJobs = false
  }
}

/**
 * Why 1100? Becase we default `fetchPoll` to 1000ms, and we want to make sure
 * we're waiting just a little longer than that.
 */
const DEFAULT_WAIT_TIME = 1100

function wait(timeout: number) {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

export class JobsCollection {
  jobs = new Map<string, Job>()
  #jobQueues = new Map<JobQueuesTypes, JobQueue>(
    Object.values(JobQueuesTypes).map(queueName => [queueName, new JobQueue(queueName)]),
  )

  public performLater(job: Job) {
    this.jobs.set(job.id, job)

    const currentQueue = this.#jobQueues.get(job.queue)
    if (!currentQueue) throw new Error(`Queue ${job.queue} has not been registered`)
    currentQueue.enqueue(job)

    return job
  }

  public get(jobId: string) {
    const job = this.jobs.get(jobId)
    if (!job) throw new Error(`Job ${jobId} not found`)
    return job
  }
}
