import type {Language} from '../../types'

export interface RoutePayload {
  adminEmail: string
  availableLanguages: Language[]
  canCollectPrivateTelemetry: boolean
  createPath: string
  enoughDataToTrain: boolean
  organization: string
}
