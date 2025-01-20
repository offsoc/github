export type TopicSetting = {
  canContact: boolean
  culture: string
  description: string
  name: string
  id: string
  topicMasterId: string
}

export type EmailSubscriptionFormProps = {
  paramEmail?: string

  paramCTID?: string
  paramECID?: string
  paramK?: string
  paramD?: string
  paramPID?: string
  paramTID?: string
  paramCMID?: string
  paramMK?: string
}

export type CPMParamsState = {
  CTID?: string
  ECID?: string
  K?: string
  D?: string
  PID?: string
  TID?: string
  CMID?: string
  MK?: string
}

export type UseTopicSettingsParams = {
  paramEmail?: string
  paramCTID?: string
  paramECID?: string
  paramK?: string
  paramD?: string
  paramPID?: string
  paramTID?: string
  paramCMID?: string
  paramMK?: string

  setCPMParams: (cpmParams: CPMParamsState) => void
  setEmail: (email: string) => void
}

export type TopicSettingsResponse = {
  done: boolean
  topics: TopicSetting[]
  error?: {retriable: boolean}
}

export type TopicsRef = {
  [topicID: string]: HTMLDivElement | null
}

export type EmailSubscriptionTopicsParams = {
  CTID: string
  ECID: string
  K: string
  D?: string
  PID?: string
  TID?: string
  CMID?: string
  MK?: string
}
