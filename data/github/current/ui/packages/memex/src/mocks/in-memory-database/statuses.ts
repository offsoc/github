import type {PersistedOption} from '../../client/api/columns/contracts/single-select'
import type {MemexStatus} from '../../client/api/memex/contracts'
import {deepCopy} from './utils'

export class StatusesCollection {
  private statuses: Array<MemexStatus>

  constructor(statuses: Array<MemexStatus> = []) {
    this.statuses = deepCopy(statuses)
  }

  public all() {
    return this.statuses
  }

  public getFirstItem() {
    return this.statuses[0]
  }

  public add(status: MemexStatus) {
    this.statuses.push(status)
  }

  public update(
    id: number,
    options: {
      body: string
      status: PersistedOption
      startDate: string | null
      targetDate: string | null
    },
  ) {
    const existingStatus = this.statuses.find(status => status.id === id)
    if (!existingStatus) {
      throw new Error(`No status exists with id: ${id}`)
    }

    const updatedStatus: MemexStatus = {
      ...existingStatus,
      body: options.body,
      bodyHtml: options.body,
      updatedAt: new Date().toISOString(),
      statusValue: {
        status: options.status,
        statusId: options.status.id,
        startDate: options.startDate,
        targetDate: options.targetDate,
      },
    }

    this.statuses = this.statuses.map(status => {
      if (status.id === id) {
        return updatedStatus
      }
      return status
    })

    return updatedStatus
  }

  public destroy(id: number) {
    this.statuses.filter(status => status.id !== id)
  }
}
