import type {PersistedOption} from '../../client/api/columns/contracts/single-select'
import type {MemexCreateStatusBody} from '../../client/api/memex/api-create-status'
import type {MemexUpdateStatusBody} from '../../client/api/memex/api-update-status'
import type {MemexStatusResponse} from '../../client/api/memex/contracts'
import {mockUsers} from '../data/users'
import {delete_destroyStatus, get_getStatuses, post_createStatus, put_updateStatus} from '../msw-responders/statuses'
import {BaseController} from './base-controller'

const DEFAULT_STATUS_OPTIONS: [PersistedOption, PersistedOption, PersistedOption, PersistedOption, PersistedOption] = [
  {
    id: '8be313fb',
    name: 'Inactive',
    nameHtml: 'Inactive',
    color: 'GRAY',
    description: 'This project is inactive.',
    descriptionHtml: 'This project is inactive.',
  },
  {
    id: '459eafad',
    name: 'On track',
    nameHtml: 'On track',
    color: 'GREEN',
    description: 'This project is on track with no risks.',
    descriptionHtml: 'This project is on track with no risks.',
  },
  {
    id: '366655d6',
    name: 'At risk',
    nameHtml: 'At risk',
    color: 'YELLOW',
    description: 'This project is at risk and encountering some challenges.',
    descriptionHtml: 'This project is at risk and encountering some challenges.',
  },
  {
    id: '04201a9a',
    name: 'Off track',
    nameHtml: 'Off track',
    color: 'RED',
    description: 'This project is off track and needs attention.',
    descriptionHtml: 'This project is off track and needs attention.',
  },
  {
    id: 'c77b75a3',
    name: 'Complete',
    nameHtml: 'Complete',
    color: 'PURPLE',
    description: 'This project is complete.',
    descriptionHtml: 'This project is complete.',
  },
]

export class StatusesController extends BaseController {
  private nextId = 100

  get() {
    return {
      statuses: this.db.statuses.all(),
      form: {
        status: {
          options: DEFAULT_STATUS_OPTIONS,
        },
      },
    }
  }

  getLatestitem() {
    return this.db.statuses.getFirstItem()
  }

  async createStatus(reqBody: MemexCreateStatusBody): Promise<MemexStatusResponse> {
    this.server.sleep()

    const id = this.nextId++
    const option = DEFAULT_STATUS_OPTIONS.find(status => status.id === reqBody.statusId)
    const [mockUser] = mockUsers

    if (!mockUser) {
      throw new Error('No mock user found')
    }

    const newStatus = {
      id,
      body: reqBody.body,
      bodyHtml: reqBody.body,
      creator: mockUser,
      updatedAt: new Date().toISOString(),
      statusValue: {
        status: option || null,
        statusId: option?.id || null,
        startDate: reqBody.startDate,
        targetDate: reqBody.targetDate,
      },
      userHidden: false,
    }

    this.db.statuses.add(newStatus)

    return {status: newStatus, viewerIsSubscribed: true}
  }

  async updateStatus(reqBody: MemexUpdateStatusBody): Promise<MemexStatusResponse> {
    this.server.sleep()

    const statusOption =
      DEFAULT_STATUS_OPTIONS.find(status => status.id === reqBody.statusId) || DEFAULT_STATUS_OPTIONS[0]
    const [mockUser] = mockUsers

    if (!mockUser) {
      throw new Error('No mock user found')
    }

    const updatedStatus = this.db.statuses.update(reqBody.id, {
      body: reqBody.body,
      status: statusOption,
      startDate: reqBody.startDate,
      targetDate: reqBody.targetDate,
    })

    return {status: updatedStatus, viewerIsSubscribed: true}
  }

  async destroyStatus(id: number): Promise<undefined> {
    this.server.sleep()

    this.db.statuses.destroy(id)
  }

  public override handlers = [
    get_getStatuses(async () => {
      return this.get()
    }),
    post_createStatus(async body => {
      return this.createStatus(body)
    }),
    put_updateStatus(async body => {
      return this.updateStatus(body)
    }),
    delete_destroyStatus(async (_, req) => {
      const id = new URL(req.url).href.split('/').at(-1)

      if (!id) return

      await this.destroyStatus(Number(id))
    }),
  ]
}
