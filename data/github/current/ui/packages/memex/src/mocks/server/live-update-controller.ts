import type {MemexRefreshEvents} from '../data/memex-refresh-events'
import {MemexItemRefreshEvents, MemexPaginatedRefreshEvents} from '../data/memex-refresh-events'
import {mockMemexAliveConfig} from '../socket-message'
import {BaseController} from './base-controller'

const MESSAGE_SOCKET_CHANNEL_ELEMENT_SELECTOR = `.js-socket-channel[data-channel=${mockMemexAliveConfig.messageChannel}]`

export class LiveUpdatesController extends BaseController {
  public sendSocketMessage(args: {type: ObjectValues<typeof MemexRefreshEvents>}) {
    if (!this.server.liveUpdatesEnabled) return
    const data: Record<string, any> = {
      actor: {id: 100},
      payload: {id: 1000},
      ...args,
    }
    if (data.type === MemexPaginatedRefreshEvents.ProjectItemDenormalizedToElasticsearch) {
      // isValidMemexRefreshEventShape uses this field to identify refresh event types
      delete data.payload
    }
    const element = MESSAGE_SOCKET_CHANNEL_ELEMENT_SELECTOR

    const detail = {
      waitFor: 0,
      data,
    }

    const el = document.querySelector(element)
    if (!el) return false

    /* eslint eslint-comments/no-use: off */

    console.groupCollapsed(`[WS] Sending message - ${args.type} `)
    console.log('Message detail\n', detail)
    console.groupEnd()

    return el.dispatchEvent(new CustomEvent('socket:message', {detail}))
  }

  public queueSocketMessage(args: {type: ObjectValues<typeof MemexRefreshEvents>}) {
    if (!this.server.liveUpdatesEnabled) return
    setTimeout(() => {
      this.sendSocketMessage(args)
    }, 250)
    if (Object.values(MemexItemRefreshEvents).includes(args.type)) {
      setTimeout(() => {
        // Send denormalization live update for item updates
        // Long timeout ensures pendingUpdatesSingleton settles before live update arrives
        this.sendSocketMessage({type: MemexPaginatedRefreshEvents.ProjectItemDenormalizedToElasticsearch})
      }, 1000)
    }
  }

  public sendSidePanelSocketMessage(draftItemId = 0) {
    const element = `.js-socket-channel[data-channel^="side-panel-"]`

    const detail = draftItemId
      ? {
          waitFor: 0,
          data: {
            type: 'mock-socket-refresh-event',
            payload: {item_id: draftItemId},
            actor: {id: 100},
          },
        }
      : {
          waitFor: 0,
          data: {
            reason: 'issue-changed',
          },
        }

    const el = document.querySelector(element)

    if (!el) return false

    return el.dispatchEvent(new CustomEvent('socket:message', {detail}))
  }
  public sendMigrationMessage(migrationStatus: string) {
    const element = MESSAGE_SOCKET_CHANNEL_ELEMENT_SELECTOR

    const detail = {
      waitFor: 0,
      data: {
        project_migration: {
          id: '1',
          source_project_id: 2,
          target_memex_project_id: 3,
          status: migrationStatus,
          requester_id: '2',
          last_retried_at: null,
          last_migrated_project_item_id: null,
          completed_at: null,
          updated_at: null,
          created_at: null,
          source_project: {
            name: 'name',
            closed: true,
            path: '/orgs/testorg/projects/1',
          },
        },
      },
    }

    const el = document.querySelector(element)

    if (!el) return false

    return el.dispatchEvent(new CustomEvent('socket:message', {detail}))
  }
}
