type Metadata = Record<string, unknown>

export interface UserPresence {
  userId: number
  metadata: Array<Metadata>
  isOwnUser: boolean
  isIdle?: boolean
}
