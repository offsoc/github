import {signChannel} from '@github-ui/use-alive/test-utils'
import type {ImportViewPayload} from '../routes/ImportView'

export function getImportViewRoutePayload(): ImportViewPayload {
  return {
    channel: signChannel('websocket-channel-name'),
    status: 'MIGRATION_STATE_IN_PROGRESS',
    failure_reason: '',
    error_details: [],
  }
}
